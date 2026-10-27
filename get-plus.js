#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function getGitRoot(cwd = process.cwd()) {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    encoding: 'utf8',
  }).trim();
}

function getUnstagedFiles(gitRoot) {
  const opts = { cwd: gitRoot, encoding: 'utf8' };

  const modified = execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR'],
    opts,
  )
    .trim()
    .split('\n')
    .filter(Boolean);

  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    opts,
  )
    .trim()
    .split('\n')
    .filter(Boolean);

  return [...new Set([...modified, ...untracked])].filter(
    (file) => !/(^|\/)test\//.test(file),
  );
}

function packFiles(files, gitRoot, outputDir) {
  const resolvedOutput = path.resolve(outputDir);
  fs.mkdirSync(resolvedOutput, { recursive: true });

  let copied = 0;
  let skipped = 0;

  for (const file of files) {
    const src = path.join(gitRoot, file);
    const dest = path.join(resolvedOutput, file);

    if (!fs.existsSync(src)) {
      skipped++;
      continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copied++;
  }

  return { copied, skipped, outputDir: resolvedOutput };
}

/** 定位打包结果下的 packages 目录 */
function resolvePackedPackagesDir(outputDir) {
  const packagesDir = path.join(outputDir, 'packages');
  if (!fs.existsSync(packagesDir) || !fs.statSync(packagesDir).isDirectory()) {
    return null;
  }
  return packagesDir;
}

/** 在 getCode 下执行 node get.js <packagesDir> --single，返回生成的 PNG 路径 */
function generateSingleImage(packagesDir, gitRoot) {
  const getCodeDir = path.join(gitRoot, 'getCode');
  const getJs = path.join(getCodeDir, 'get.js');

  if (!fs.existsSync(getJs)) {
    console.error(`未找到 ${getJs}`);
    process.exit(1);
  }

  console.log(`\n正在生成图片: node get.js ${packagesDir} --single`);
  execFileSync(process.execPath, [getJs, packagesDir, '--single'], {
    cwd: getCodeDir,
    stdio: 'inherit',
  });

  // --single 默认输出 getCode/output/<源目录名>_all.png；packages → packages_all.png
  const leaf = path.basename(packagesDir);
  const exportPrefix = leaf === 'pages' ? 'views' : leaf;
  const imagePath = path.join(getCodeDir, 'output', `${exportPrefix}_all.png`);

  if (!fs.existsSync(imagePath)) {
    console.error(`未找到生成的图片: ${imagePath}`);
    process.exit(1);
  }

  return imagePath;
}

/** 直接唤起隔空投送分享该文件（macOS；须用 Swift，osascript 会 canPerform=false） */
function shareViaAirDrop(filePath, gitRoot) {
  const absPath = path.resolve(filePath);
  const helper = path.join(gitRoot, 'getCode', 'share-airdrop.swift');

  if (!fs.existsSync(helper)) {
    console.warn(`未找到 ${helper}，改为在 Finder 中打开`);
    execFileSync('open', ['-R', absPath], { stdio: 'inherit' });
    return;
  }

  try {
    console.log(`正在打开隔空投送: ${absPath}`);
    // 首次会编译，稍等片刻；分享完成或取消后自动退出
    execFileSync('swift', [helper, absPath], {
      stdio: 'inherit',
      timeout: 5 * 60 * 1000,
    });
    console.log('隔空投送已结束');
  } catch {
    console.warn('隔空投送唤起失败，改为在 Finder 中打开');
    execFileSync('open', ['-R', absPath], { stdio: 'inherit' });
  }
}

function main() {
  const outputDir =
    process.argv[2] ||
    `unstaged-changes-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;

  const gitRoot = getGitRoot();
  const files = getUnstagedFiles(gitRoot);

  if (files.length === 0) {
    console.log('没有未暂存的更改');
    process.exit(0);
  }

  const {
    copied,
    skipped,
    outputDir: out,
  } = packFiles(files, gitRoot, outputDir);

  console.log(`已打包 ${copied} 个文件到 ${out}`);
  if (skipped > 0) {
    console.log(`跳过 ${skipped} 个不存在的文件（可能已在工作区删除）`);
  }

  const packagesDir = resolvePackedPackagesDir(out);
  if (!packagesDir) {
    console.warn(`打包目录下没有 packages/，跳过图片生成`);
    fs.rmSync(out, { recursive: true, force: true });
    console.log(`已删除打包目录: ${out}`);
    process.exit(0);
  }

  const imagePath = generateSingleImage(packagesDir, gitRoot);
  shareViaAirDrop(imagePath, gitRoot);

  // 图片已生成，删除临时打包目录
  fs.rmSync(out, { recursive: true, force: true });
  console.log(`已删除打包目录: ${out}`);
}

main();
