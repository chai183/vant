#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function git(cmd, cwd) {
  return execSync(`git ${cmd}`, { cwd, encoding: 'utf8' }).trim();
}

function getGitRoot(cwd = process.cwd()) {
  return git('rev-parse --show-toplevel', cwd);
}

function getUnstagedFiles(gitRoot) {
  const opts = { cwd: gitRoot, encoding: 'utf8' };

  const modified = execSync('git diff --name-only --diff-filter=ACMR', opts)
    .trim()
    .split('\n')
    .filter(Boolean);

  const untracked = execSync('git ls-files --others --exclude-standard', opts)
    .trim()
    .split('\n')
    .filter(Boolean);

  return [...new Set([...modified, ...untracked])];
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

  const { copied, skipped, outputDir: out } = packFiles(
    files,
    gitRoot,
    outputDir,
  );

  console.log(`已打包 ${copied} 个文件到 ${out}`);
  if (skipped > 0) {
    console.log(`跳过 ${skipped} 个不存在的文件（可能已在工作区删除）`);
  }
}

main();
