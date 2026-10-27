#!/usr/bin/env node
/**
 * 递归遍历源目录下所有文件，每个源文件单独渲染为一张 PNG。
 * 图片顶部显示平铺命名（源根最后一级_文件夹名_文件名），其下为正文。
 * 输出文件名为该平铺命名 + .png，存放在指定输出目录。
 *
 * 用法:
 *   node get.js <源目录或文件> [输出目录] [--pages N]
 *
 * 示例:
 *   node get.js ./docs ./out
 *   node get.js ./my-folder
 *   node get.js ./src/index.js
 *   node get.js ./large.txt ./out --pages 5
 *   node get.js ./src --git
 *   node get.js ./src --single
 *   node get.js ./src --horizontal
 *
 * 传入单个文件时可用 --pages（或 -p）指定拆成几张 PNG，避免单图过高被截断。
 * --git（或 -g）仅处理 Git 有改动的文件，正文为相对 HEAD 的 diff（含未跟踪新文件）。
 * --single 嵌入元数据时：
 *   1) import / import type 的 from "element-plus" / from 'element-plus'
 *      改写为 @nbcb/dthr-component-v3-pc
 *   2) import BusinessTable from '@/_components/BusinessTable/index.vue'
 *      改写为 import { ElBusinessTable as BusinessTable } from '@nbcb/dthr-component-v3-pc'
 *   3) import { i18n } from "@/locales" 改写为 import i18n from "@/_plugins/i18n"
 *   4) 相对路径与正文中的目录名 pages 改写为 views（如 @/pages → @/views）
 *   5) 正文中的 @/_assets/images/ 改写为 @/assets/
 *   6) Object.hasOwn(...) 改写为 Object.prototype.hasOwnProperty.call(...)
 *
 * 将 Git 文本内容改动导出为可执行的 Node 应用脚本（仅写入有改动的文本文件）:
 *   node export-git-apply.js [输出脚本路径] [路径范围]
 *   npm run export-git
 *
 * 从生成的 PNG 还原源文件（读取嵌入的元数据）:
 *   node image-to-file.js [PNG 目录或文件] [输出目录]
 *   npm run restore
 *
 * 从 --horizontal 横排图 OCR 还原源码（无元数据/拍照截图时用，近似还原）:
 *   node horizontal-ocr-to-file.js [PNG 目录或文件] [输出目录]
 *   npm run restore:ocr
 *
 * 将源文件元数据写入已有 PNG（不重新渲染图片）:
 *   node get.js <源目录或文件> --embed <目标PNG> [输出PNG] [--git]
 *   npm run embed -- <源> --embed <目标PNG> [输出PNG]
 *
 * 未指定输出目录时，PNG 生成在项目下的 output/ 目录。
 * 若输出目录在源目录内，会自动跳过该目录，避免把生成的图片再当源文件处理。
 * 遍历时跳过目录：node_modules、.git、test（任意层级下的 test 文件夹）。
 * 文本按 UTF-8 / UTF-16（带 BOM）读取；非合法 UTF-8 时按 GB18030 解码（常见 Windows 中文编码）。
 */

const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const gb18030Decoder = new TextDecoder('gb18030');

const execFileAsync = promisify(execFile);
const GIT_MAX_BUFFER = 10 * 1024 * 1024;
const { createCanvas } = require('@napi-rs/canvas');
const {
  embedSourceInPng,
  embedAllSourcesInPng,
  writeMetadataToPng,
} = require('./image-to-file');

/** 默认输出目录（与 get.js 同级的 output/） */
const DEFAULT_OUTPUT_DIR = path.join(__dirname, 'output');

/** 等宽 + 常见中文黑体回退，减轻缺字/方块 */
const FONT_FAMILY =
  'ui-monospace, Menlo, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", monospace';

const FONT_SIZE = 14;
const LINE_HEIGHT = Math.round(FONT_SIZE * 1.45);
const TITLE_FONT_SIZE = 16;
const TITLE_LINE_HEIGHT = Math.round(TITLE_FONT_SIZE * 1.35);
const PADDING = 24;
const SECTION_GAP = LINE_HEIGHT * 2;
const MAX_CANVAS_WIDTH = 1400;
const MAX_CANVAS_HEIGHT = 32000;
/** --horizontal 模式：固定画布高度，内容按列水平排列 */
const HORIZONTAL_HEIGHT = 1080;
const HORIZONTAL_COLUMN_WIDTH = 480;
const HORIZONTAL_COLUMN_GAP = 20;
const HORIZONTAL_COL_INNER_PAD = 12;
/** 导出 PNG 的像素倍率（2 = 2x 分辨率，文字更清晰） */
const RENDER_SCALE = 2;
const MAX_BYTES = 2 * 1024 * 1024; // 单文件默认最多读 2MB，避免内存爆掉
const MAX_BYTES_PER_PAGE = 2 * 1024 * 1024; // 多页模式下按页数放宽读取上限

/** --single 导出时，element-plus / BusinessTable 替换为目标包 */
const INTRANET_COMPONENT_PKG = '@nbcb/dthr-component-v3-pc';

/**
 * 将 import / import type 的 `from "element-plus"` / `from 'element-plus'`
 * 改写为目标组件库。
 */
function rewriteElementPlusImports(text) {
  if (!text || !text.includes('element-plus')) return text;
  return text.replace(
    /\bfrom\s*(['"])element-plus\1/g,
    (match, quote, offset) => {
      // 仅改写 import / import type 语句中的 from
      const before = text.slice(0, offset);
      if (!/\bimport\s+(?:type\b)?(?:(?!\bimport\b)[\s\S])*$/.test(before))
        return match;
      return `from ${quote}${INTRANET_COMPONENT_PKG}${quote}`;
    },
  );
}

/**
 * 将 `import BusinessTable from '@/_components/BusinessTable/index.vue'`
 * 改写为 `import { ElBusinessTable as BusinessTable } from '@nbcb/dthr-component-v3-pc'`。
 * 兼容单双引号，以及 index.vue / index / .vue / 目录 等常见路径写法。
 */
function rewriteBusinessTableImports(text) {
  if (!text || !text.includes('BusinessTable')) return text;
  return text.replace(
    /\bimport\s+BusinessTable\s+from\s*(['"])@\/_components\/BusinessTable(?:\/index(?:\.vue)?|\.vue)?\1/g,
    (match, quote) =>
      `import { ElBusinessTable as BusinessTable } from ${quote}${INTRANET_COMPONENT_PKG}${quote}`,
  );
}

/**
 * 将 `import { i18n } from "@/locales"` 改写为 `import i18n from "@/_plugins/i18n"`。
 * 兼容单双引号，以及多余空白。
 */
function rewriteI18nImports(text) {
  if (!text || !text.includes('@/locales')) return text;
  return text.replace(
    /\bimport\s*\{\s*i18n\s*\}\s*from\s*(['"])@\/locales\1/g,
    (match, quote) => `import i18n from ${quote}@/_plugins/i18n${quote}`,
  );
}

/** 相对路径中的目录段 pages → views（兼容 / 与 \） */
function rewritePagesDirInRel(rel) {
  if (!rel) return rel;
  return String(rel)
    .split(/[/\\]/)
    .map((seg) => (seg === 'pages' ? 'views' : seg))
    .join(path.sep);
}

/** 平铺 label 中的 pages 段 → views（如 pages_xxx → views_xxx） */
function rewritePagesDirInLabel(label) {
  if (!label) return label;
  return String(label)
    .replace(/^pages(?=_)/, 'views')
    .replace(/_pages(?=_)/g, '_views');
}

/**
 * 正文中的 pages 目录引用改为 views：
 * - @/pages、@/pages/… → @/views…
 * - /pages/、\pages\ 路径段 → /views/、\views\
 */
function rewritePagesDirInText(text) {
  if (!text || !text.includes('pages')) return text;
  return text
    .replace(/(^|[^A-Za-z0-9_])@\/pages(?=\/|['"`]|$)/g, '$1@/views')
    .replace(/(^|[^A-Za-z0-9_])pages(?=\/)/g, '$1views')
    .replace(/(^|[^A-Za-z0-9_])pages(?=\\)/g, '$1views');
}

/**
 * 正文中的资源别名 @/_assets/images/ 改为 @/assets/
 * （@/_assets/images/xxx → @/assets/xxx）
 */
function rewriteAssetsImagesInText(text) {
  if (!text || !text.includes('@/_assets/images/')) return text;
  return text.replaceAll('@/_assets/images/', '@/assets/');
}

/**
 * 将 Object.hasOwn(...) 改写为 Object.prototype.hasOwnProperty.call(...)，
 * 兼容不支持 Object.hasOwn 的运行环境。
 */
function rewriteObjectHasOwn(text) {
  if (!text || !text.includes('Object.hasOwn')) return text;
  return text.replace(
    /\bObject\.hasOwn\s*\(/g,
    'Object.prototype.hasOwnProperty.call(',
  );
}

/** --single 导出时对单条源文件做目标环境路径/导入改写 */
function rewriteForIntranetExport({ rel, label, text }) {
  return {
    rel: rewritePagesDirInRel(rel),
    label: rewritePagesDirInLabel(label),
    text: rewriteObjectHasOwn(
      rewriteAssetsImagesInText(
        rewritePagesDirInText(
          rewriteI18nImports(
            rewriteBusinessTableImports(rewriteElementPlusImports(text)),
          ),
        ),
      ),
    ),
  };
}

/** 严格校验是否为合法 UTF-8 字节序列（避免把 GBK 等误当 UTF-8） */
function isValidUtf8(buf) {
  let i = 0;
  const len = buf.length;
  while (i < len) {
    const b0 = buf[i];
    if (b0 <= 0x7f) {
      i++;
      continue;
    }
    if ((b0 & 0xe0) === 0xc0) {
      if (i + 1 >= len || (buf[i + 1] & 0xc0) !== 0x80) return false;
      const cp = ((b0 & 0x1f) << 6) | (buf[i + 1] & 0x3f);
      if (cp < 0x80) return false;
      i += 2;
      continue;
    }
    if ((b0 & 0xf0) === 0xe0) {
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80
      )
        return false;
      const cp =
        ((b0 & 0x0f) << 12) | ((buf[i + 1] & 0x3f) << 6) | (buf[i + 2] & 0x3f);
      if (cp < 0x800) return false;
      if (cp >= 0xd800 && cp <= 0xdfff) return false;
      i += 3;
      continue;
    }
    if ((b0 & 0xf8) === 0xf0) {
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80
      )
        return false;
      const cp =
        ((b0 & 0x07) << 18) |
        ((buf[i + 1] & 0x3f) << 12) |
        ((buf[i + 2] & 0x3f) << 6) |
        (buf[i + 3] & 0x3f);
      if (cp < 0x10000 || cp > 0x10ffff) return false;
      i += 4;
      continue;
    }
    return false;
  }
  return true;
}

/**
 * 按 BOM / 编码猜测解码为字符串（默认 UTF-8；非法 UTF-8 时按 GB18030，兼容常见 Windows 中文文本）
 */
function decodeBufferToString(buf) {
  if (
    buf.length >= 3 &&
    buf[0] === 0xef &&
    buf[1] === 0xbb &&
    buf[2] === 0xbf
  ) {
    return buf.slice(3).toString('utf8');
  }
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString('utf16le');
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    const slice = buf.slice(2);
    if (slice.length >= 2 && slice.length % 2 === 0) {
      const copy = Buffer.from(slice);
      copy.swap16();
      return copy.toString('utf16le');
    }
  }
  if (isValidUtf8(buf)) {
    return buf.toString('utf8');
  }
  try {
    return gb18030Decoder.decode(buf);
  } catch {
    return buf.toString('utf8');
  }
}

function wrapLine(ctx, line, maxWidth) {
  if (!line) return [''];
  const words = line.split(/(\s+)/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const test = current + w;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      if (ctx.measureText(w).width > maxWidth) {
        let chunk = '';
        for (const ch of w) {
          const t = chunk + ch;
          if (ctx.measureText(t).width <= maxWidth) chunk = t;
          else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = w;
      }
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function buildLines(ctx, text, contentWidth) {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  for (const raw of rawLines) {
    const wrapped = wrapLine(ctx, raw, contentWidth);
    out.push(...wrapped);
  }
  return out;
}

/** 判断 child 是否在 parent 内部（含自身）；Windows 下大小写不敏感 */
function isWithinPath(child, parent) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * 输出目录位于源目录内部时，跳过该子树（避免把已生成的 PNG 等再读入）。
 * 源目录与输出目录相同时不跳过，仅由调用方排除输出文件本身。
 */
function isOutputSubtree(absPath, absIn, absOut) {
  const o = path.resolve(absOut);
  const i = path.resolve(absIn);
  if (o === i) return false;
  if (!isWithinPath(o, i)) return false;
  return isWithinPath(absPath, o);
}

/**
 * 解析目录项类型。Windows 上 readdir(withFileTypes) 对部分条目 isFile/isDirectory 均返回 false，需 stat 回退。
 */
async function resolveEntryType(fullPath, ent) {
  if (ent.isDirectory()) return 'directory';
  if (ent.isFile()) return 'file';
  try {
    const st = await fs.stat(fullPath);
    if (st.isDirectory()) return 'directory';
    if (st.isFile()) return 'file';
  } catch {
    /* 无法 stat 时视为不可处理 */
  }
  return 'other';
}

function sanitizePathSegment(seg) {
  return seg.replace(/[/\\?%*:|"<>]/g, '_');
}

/** 源根目录路径的最后一级，经 sanitize，用作输出 PNG 文件名前缀 */
function getSourceLeafPrefix(absInRoot) {
  let leaf = path.basename(path.resolve(absInRoot));
  if (!leaf || leaf === '.' || leaf === '..' || leaf === path.sep) {
    leaf = 'root';
  }
  return sanitizePathSegment(leaf);
}

async function findGitRoot(startPath) {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['rev-parse', '--show-toplevel'],
      {
        cwd: path.resolve(startPath),
      },
    );
    return stdout.trim();
  } catch {
    return null;
  }
}

/** 解析 git status --porcelain -z */
function parseGitStatusPorcelainZ(stdout) {
  const parts = stdout.split('\0').filter((p) => p.length > 0);
  const entries = [];
  for (let i = 0; i < parts.length; i++) {
    const entry = parts[i];
    const xy = entry.slice(0, 2);
    let rel = entry.slice(3);
    if (rel.includes(' -> ')) {
      rel = rel.split(' -> ').pop();
    } else if (
      (xy[0] === 'R' || xy[1] === 'R') &&
      i + 1 < parts.length &&
      !/^[ MADRCU?!]{2} /.test(parts[i + 1])
    ) {
      rel = parts[++i];
    }
    entries.push({ rel: rel.replace(/\//g, path.sep), status: xy });
  }
  return entries;
}

function isPathInInputScope(absPath, absScope, scopeKind) {
  const file = path.resolve(absPath);
  const scope = path.resolve(absScope);
  if (scopeKind === 'file') return file === scope;
  return file === scope || file.startsWith(scope + path.sep);
}

async function getGitDiffText(gitRoot, rel, status) {
  try {
    const { stdout } = await execFileAsync('git', ['diff', 'HEAD', '--', rel], {
      cwd: gitRoot,
      maxBuffer: GIT_MAX_BUFFER,
    });
    if (stdout.trim()) return stdout;
  } catch {
    /* 继续尝试其他来源 */
  }

  const isUntracked = status === '??' || status.includes('?');
  if (isUntracked) {
    const full = path.join(gitRoot, rel);
    const text = await readFileText(full);
    if (text === null) return null;
    return `[新文件 / 未跟踪]\n\n${text}`;
  }

  const isDeleted = status.includes('D');
  if (isDeleted) {
    try {
      const { stdout } = await execFileAsync(
        'git',
        ['diff', 'HEAD', '--', rel],
        {
          cwd: gitRoot,
          maxBuffer: GIT_MAX_BUFFER,
        },
      );
      return stdout.trim() || `[已删除] ${rel}`;
    } catch {
      return `[已删除] ${rel}`;
    }
  }

  return null;
}

/**
 * 收集输入范围内的 Git 改动
 * @returns {Promise<{ root: string, changes: Map<string, { status: string, diffText: string, abs: string }> }>}
 */
async function buildGitContext(absScope, scopeKind) {
  const gitRoot = await findGitRoot(absScope);
  if (!gitRoot) {
    console.error('--git 需要在 Git 仓库内使用（或路径须位于仓库中）。');
    process.exit(1);
  }

  let stdout;
  try {
    ({ stdout } = await execFileAsync('git', ['status', '--porcelain', '-z'], {
      cwd: gitRoot,
      maxBuffer: GIT_MAX_BUFFER,
    }));
  } catch (e) {
    console.error('无法执行 git status:', e.message);
    process.exit(1);
  }

  const changes = new Map();
  const statusEntries = parseGitStatusPorcelainZ(stdout);

  for (const { rel, status } of statusEntries) {
    const abs = path.resolve(gitRoot, rel);
    if (!isPathInInputScope(abs, absScope, scopeKind)) continue;

    const diffText = await getGitDiffText(gitRoot, rel, status);
    if (diffText === null) continue;

    changes.set(rel, { status, diffText, abs });
  }

  return { root: gitRoot, changes };
}

/** 根据相对路径生成平铺显示名（不含 .png） */
function buildFlatLabel(rel, sourceLeafPrefix) {
  const safeParts = rel.split(path.sep).map(sanitizePathSegment);
  const fileName = safeParts.pop();
  const folderParts = safeParts;
  const parts = [sourceLeafPrefix];
  if (folderParts.length) parts.push(...folderParts);
  parts.push(fileName);
  return parts.join('_');
}

async function readFileText(filePath, maxBytes = MAX_BYTES) {
  let buf;
  try {
    buf = await fs.readFile(filePath);
  } catch (e) {
    console.error(`跳过（无法读取）: ${filePath}`, e.message);
    return null;
  }

  if (buf.length > maxBytes) {
    console.warn(`跳过（超过 ${maxBytes} 字节）: ${filePath}`);
    return null;
  }

  let text = decodeBufferToString(buf);

  const sample = text.slice(0, Math.min(text.length, 4096));
  let hasControlChar = false;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (
      (code >= 0x00 && code <= 0x08) ||
      code === 0x0b ||
      code === 0x0c ||
      (code >= 0x0e && code <= 0x1f)
    ) {
      hasControlChar = true;
      break;
    }
  }
  const hasBinary = buf.includes(0) || hasControlChar;
  if (hasBinary) {
    text =
      '[二进制或非 UTF-8 文本，无法完整以文本展示]\n\n' +
      buf
        .toString('hex', 0, Math.min(buf.length, 8000))
        .replace(/(.{64})/g, '$1\n');
  }

  return text;
}

/**
 * 将单个文件排版为绘制项列表
 * @returns {{ items: Array, height: number, truncated: boolean }}
 */
function planSingleFileLayout(label, text, mctx) {
  const contentWidth = MAX_CANVAS_WIDTH - PADDING * 2;
  const items = [];
  let y = PADDING;
  let truncated = false;
  const maxY = MAX_CANVAS_HEIGHT - PADDING - LINE_HEIGHT * 2;

  function canFit(lineHeight) {
    return y + lineHeight <= maxY;
  }

  function pushLine(text, fontSize, color, lineHeight) {
    if (!canFit(lineHeight)) {
      truncated = true;
      return false;
    }
    items.push({ text, fontSize, color, lineHeight, y: y + fontSize });
    y += lineHeight;
    return true;
  }

  function pushWrapped(text, fontSize, color, lineHeight) {
    mctx.font = `${fontSize}px ${FONT_FAMILY}`;
    const wrapped = wrapLine(mctx, text, contentWidth);
    for (const line of wrapped) {
      if (!pushLine(line, fontSize, color, lineHeight)) return false;
    }
    return true;
  }

  if (
    !pushWrapped(`▸ ${label}`, TITLE_FONT_SIZE, '#7eb8da', TITLE_LINE_HEIGHT)
  ) {
    return finalize();
  }

  y += SECTION_GAP;
  mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  const bodyLines = buildLines(mctx, text, contentWidth);
  for (const line of bodyLines) {
    if (!pushLine(line, FONT_SIZE, '#e8e8e8', LINE_HEIGHT)) break;
  }

  return finalize();

  function finalize() {
    if (truncated) {
      const msg = `… 内容已截断（画布高度上限 ${MAX_CANVAS_HEIGHT}px）`;
      mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
      const msgLines = wrapLine(mctx, msg, contentWidth);
      for (const line of msgLines) {
        if (!canFit(LINE_HEIGHT)) break;
        items.push({
          text: line,
          fontSize: FONT_SIZE,
          color: '#ff9966',
          lineHeight: LINE_HEIGHT,
          y: y + FONT_SIZE,
        });
        y += LINE_HEIGHT;
      }
    }
    return {
      items,
      height: Math.min(Math.ceil(y + PADDING), MAX_CANVAS_HEIGHT),
      truncated,
    };
  }
}

function labelToPngFilename(label, pageIndex, pageTotal) {
  if (!pageTotal || pageTotal <= 1) return `${label}.png`;
  const pad = String(pageTotal).length;
  const suffix = String(pageIndex).padStart(pad, '0');
  return `${label}_${suffix}.png`;
}

/** 单页可用正文行数（扣除标题与页脚余量） */
function maxBodyLinesPerPage() {
  const titleBlock = TITLE_LINE_HEIGHT + SECTION_GAP;
  const maxY = MAX_CANVAS_HEIGHT - PADDING - LINE_HEIGHT * 2;
  const bodyStart = PADDING + titleBlock;
  return Math.max(1, Math.floor((maxY - bodyStart) / LINE_HEIGHT));
}

/**
 * 将单文件正文拆成多页布局（仅用于 --pages > 1）
 * @returns {Array<{ items: Array, height: number, truncated: boolean }>}
 */
function planFilePageLayouts(label, text, mctx, pageCount) {
  const contentWidth = MAX_CANVAS_WIDTH - PADDING * 2;
  mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  const bodyLines = buildLines(mctx, text, contentWidth);
  const cap = maxBodyLinesPerPage();
  const pages = Math.max(1, pageCount);
  const chunkSize = Math.max(1, Math.ceil(bodyLines.length / pages));
  const layouts = [];
  let truncated = false;

  for (let p = 0; p < pages; p++) {
    const start = p * chunkSize;
    if (start >= bodyLines.length) break;
    const slice = bodyLines.slice(start, start + chunkSize);
    const pageLabel =
      pages > 1 ? `▸ ${label} (${p + 1}/${pages})` : `▸ ${label}`;
    const linesForPage = slice.length > cap ? slice.slice(0, cap) : slice;
    if (slice.length > cap) truncated = true;

    const layout = planBodyPageLayout(
      pageLabel,
      linesForPage,
      mctx,
      contentWidth,
    );
    layouts.push(layout);
  }

  if (truncated && layouts.length) {
    layouts[layouts.length - 1].truncated = true;
  }
  return layouts;
}

/** 仅绘制标题 + 指定正文行 */
function planBodyPageLayout(pageLabel, bodyLines, mctx, contentWidth) {
  const items = [];
  let y = PADDING;
  let truncated = false;
  const maxY = MAX_CANVAS_HEIGHT - PADDING - LINE_HEIGHT * 2;

  function canFit(lineHeight) {
    return y + lineHeight <= maxY;
  }

  function pushLine(text, fontSize, color, lineHeight) {
    if (!canFit(lineHeight)) {
      truncated = true;
      return false;
    }
    items.push({ text, fontSize, color, lineHeight, y: y + fontSize });
    y += lineHeight;
    return true;
  }

  function pushWrapped(text, fontSize, color, lineHeight) {
    mctx.font = `${fontSize}px ${FONT_FAMILY}`;
    const wrapped = wrapLine(mctx, text, contentWidth);
    for (const line of wrapped) {
      if (!pushLine(line, fontSize, color, lineHeight)) return false;
    }
    return true;
  }

  if (!pushWrapped(pageLabel, TITLE_FONT_SIZE, '#7eb8da', TITLE_LINE_HEIGHT)) {
    return { items, height: Math.ceil(y + PADDING), truncated: true };
  }

  y += SECTION_GAP;
  mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  for (const line of bodyLines) {
    if (!pushLine(line, FONT_SIZE, '#e8e8e8', LINE_HEIGHT)) {
      truncated = true;
      break;
    }
  }

  if (truncated) {
    const msg = `… 本页内容已截断（画布高度上限 ${MAX_CANVAS_HEIGHT}px）`;
    mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    for (const line of wrapLine(mctx, msg, contentWidth)) {
      if (!canFit(LINE_HEIGHT)) break;
      items.push({
        text: line,
        fontSize: FONT_SIZE,
        color: '#ff9966',
        lineHeight: LINE_HEIGHT,
        y: y + FONT_SIZE,
      });
      y += LINE_HEIGHT;
    }
  }

  return {
    items,
    height: Math.min(Math.ceil(y + PADDING), MAX_CANVAS_HEIGHT),
    truncated,
  };
}

/**
 * --single 模式：仅生成携带元数据的小图，不渲染文件正文
 */
function planMetadataOnlyLayout(sourceLeafPrefix, fileCount) {
  const titleY = PADDING + TITLE_FONT_SIZE;
  const subtitleY = PADDING + TITLE_LINE_HEIGHT + SECTION_GAP + FONT_SIZE;
  const height = subtitleY + PADDING;
  return {
    items: [
      {
        text: `▸ ${sourceLeafPrefix}_all`,
        fontSize: TITLE_FONT_SIZE,
        color: '#7eb8da',
        lineHeight: TITLE_LINE_HEIGHT,
        y: titleY,
      },
      {
        text: `${fileCount} 个源文件 · 元数据已嵌入`,
        fontSize: FONT_SIZE,
        color: '#888888',
        lineHeight: LINE_HEIGHT,
        y: subtitleY,
      },
    ],
    height,
    truncated: false,
  };
}

/** --horizontal 模式下单列可用正文行数 */
function maxBodyLinesInHorizontalColumn() {
  const titleBlock = TITLE_LINE_HEIGHT + SECTION_GAP;
  const maxY = HORIZONTAL_HEIGHT - PADDING - LINE_HEIGHT * 2;
  const bodyStart = PADDING + titleBlock;
  return Math.max(1, Math.floor((maxY - bodyStart) / LINE_HEIGHT));
}

/**
 * 固定高度、多列水平排版
 * @param {Array<{ label: string, bodyLines: string[] }>} columns
 */
function planHorizontalColumnsLayout(columns, mctx) {
  const contentWidth = HORIZONTAL_COLUMN_WIDTH - HORIZONTAL_COL_INNER_PAD * 2;
  const cap = maxBodyLinesInHorizontalColumn();
  const items = [];
  let truncated = false;
  let x = PADDING;

  for (let ci = 0; ci < columns.length; ci++) {
    const { label, bodyLines } = columns[ci];
    const colX = x;
    let y = PADDING;

    mctx.font = `${TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
    for (const line of wrapLine(mctx, `▸ ${label}`, contentWidth)) {
      items.push({
        text: line,
        x: colX + HORIZONTAL_COL_INNER_PAD,
        y: y + TITLE_FONT_SIZE,
        fontSize: TITLE_FONT_SIZE,
        color: '#7eb8da',
        lineHeight: TITLE_LINE_HEIGHT,
      });
      y += TITLE_LINE_HEIGHT;
    }
    y += SECTION_GAP;

    mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    const linesToDraw = bodyLines.slice(0, cap);
    if (bodyLines.length > cap) truncated = true;

    for (const line of linesToDraw) {
      items.push({
        text: line,
        x: colX + HORIZONTAL_COL_INNER_PAD,
        y: y + FONT_SIZE,
        fontSize: FONT_SIZE,
        color: '#e8e8e8',
        lineHeight: LINE_HEIGHT,
      });
      y += LINE_HEIGHT;
    }

    if (ci < columns.length - 1) {
      const dividerX = x + HORIZONTAL_COLUMN_WIDTH + HORIZONTAL_COLUMN_GAP / 2;
      items.push({
        divider: true,
        vertical: true,
        x: dividerX,
        y: PADDING,
        height: HORIZONTAL_HEIGHT - PADDING * 2,
      });
    }

    x += HORIZONTAL_COLUMN_WIDTH + HORIZONTAL_COLUMN_GAP;
  }

  if (truncated) {
    const msg = `… 部分列内容已截断（高度 ${HORIZONTAL_HEIGHT}px）`;
    mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    const msgX = Math.max(PADDING, x - HORIZONTAL_COLUMN_WIDTH);
    let y = HORIZONTAL_HEIGHT - PADDING - LINE_HEIGHT;
    for (const line of wrapLine(
      mctx,
      msg,
      HORIZONTAL_COLUMN_WIDTH - HORIZONTAL_COL_INNER_PAD * 2,
    )) {
      items.push({
        text: line,
        x: msgX + HORIZONTAL_COL_INNER_PAD,
        y: y + FONT_SIZE,
        fontSize: FONT_SIZE,
        color: '#ff9966',
        lineHeight: LINE_HEIGHT,
      });
      y -= LINE_HEIGHT;
    }
  }

  const width =
    columns.length > 0
      ? PADDING * 2 +
        columns.length * HORIZONTAL_COLUMN_WIDTH +
        (columns.length - 1) * HORIZONTAL_COLUMN_GAP
      : MAX_CANVAS_WIDTH;

  return { items, width, height: HORIZONTAL_HEIGHT, truncated };
}

/**
 * 将单个文件正文按列高拆成多列（超长时向右续列，避免截断）
 * @returns {Array<{ label: string, bodyLines: string[] }>}
 */
function splitTextIntoHorizontalColumns(label, text, mctx) {
  const contentWidth = HORIZONTAL_COLUMN_WIDTH - HORIZONTAL_COL_INNER_PAD * 2;
  mctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  const bodyLines = buildLines(mctx, text, contentWidth);
  const cap = maxBodyLinesInHorizontalColumn();
  const columns = [];

  for (let i = 0; i < bodyLines.length; i += cap) {
    const slice = bodyLines.slice(i, i + cap);
    const part = Math.floor(i / cap) + 1;
    const colLabel = part === 1 ? label : `${label} (${part})`;
    columns.push({ label: colLabel, bodyLines: slice });
  }

  if (columns.length === 0) {
    columns.push({ label, bodyLines: [''] });
  }

  return columns;
}

/** 目录模式：每个源文件至少一列；内容超高时自动续列，保证完整展示 */
function planHorizontalMultiFileLayout(fileEntries, mctx) {
  const columns = [];
  for (const { label, text } of fileEntries) {
    columns.push(...splitTextIntoHorizontalColumns(label, text, mctx));
  }
  return planHorizontalColumnsLayout(columns, mctx);
}

/** 单文件模式：正文按高度拆成多列 */
function planHorizontalSingleFileLayout(label, text, mctx) {
  return planHorizontalColumnsLayout(
    splitTextIntoHorizontalColumns(label, text, mctx),
    mctx,
  );
}

function renderImage(layout) {
  const { items, height, width = MAX_CANVAS_WIDTH } = layout;
  const w = width * RENDER_SCALE;
  const h = height * RENDER_SCALE;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  for (const item of items) {
    if (item.divider) {
      ctx.strokeStyle = '#3d5a73';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (item.vertical) {
        ctx.moveTo(item.x, item.y);
        ctx.lineTo(item.x, item.y + item.height);
      } else {
        ctx.moveTo(PADDING, item.y);
        ctx.lineTo(width - PADDING, item.y);
      }
      ctx.stroke();
      continue;
    }
    ctx.fillStyle = item.color;
    ctx.font = `${item.fontSize}px ${FONT_FAMILY}`;
    ctx.fillText(item.text, item.x ?? PADDING, item.y);
  }

  return canvas.toBuffer('image/png');
}

/**
 * 收集待合并的文件列表
 * @returns {Promise<Array<{ label: string, text: string, rel: string }>>}
 */
async function collectFiles(dir, absIn, absOut, sourceLeafPrefix, skipOutPath) {
  const resolvedDir = path.resolve(dir);
  if (isOutputSubtree(resolvedDir, absIn, absOut)) {
    return [];
  }

  let entries;
  try {
    entries = await fs.readdir(resolvedDir, { withFileTypes: true });
  } catch (e) {
    console.error(`跳过（无法读取目录）: ${resolvedDir}`, e.message);
    return [];
  }

  const scriptPath = path.resolve(__filename);
  const result = [];

  for (const ent of entries) {
    if (ent.name === '.DS_Store') continue;
    if (ent.name === 'node_modules' || ent.name === '.git') continue;

    const full = path.join(resolvedDir, ent.name);
    const resolvedFull = path.resolve(full);
    const entryType = await resolveEntryType(resolvedFull, ent);

    if (entryType === 'directory') {
      if (isOutputSubtree(resolvedFull, absIn, absOut)) continue;
      if (ent.name === 'test') continue;
      const nested = await collectFiles(
        full,
        absIn,
        absOut,
        sourceLeafPrefix,
        skipOutPath,
      );
      result.push(...nested);
      continue;
    }

    if (entryType !== 'file') continue;
    if (resolvedFull === scriptPath) continue;
    if (skipOutPath && resolvedFull === skipOutPath) continue;
    if (ent.name.endsWith('.png')) continue;

    if (!isWithinPath(resolvedFull, absIn)) continue;
    const rel = path.relative(absIn, resolvedFull);

    const label = buildFlatLabel(rel, sourceLeafPrefix);
    const text = await readFileText(resolvedFull);
    if (text === null) continue;

    result.push({ rel, label, text });
  }

  result.sort((a, b) =>
    a.rel.localeCompare(b.rel, undefined, { sensitivity: 'base' }),
  );
  return result;
}

/**
 * --git：仅收集输入范围内有改动的文件，正文为 diff
 */
async function collectGitChangedFiles(
  absIn,
  absOut,
  sourceLeafPrefix,
  gitContext,
  scopeKind,
) {
  const scriptPath = path.resolve(__filename);
  const result = [];

  for (const [, { diffText, abs }] of gitContext.changes) {
    const resolvedFull = path.resolve(abs);
    if (!isPathInInputScope(resolvedFull, absIn, scopeKind)) continue;
    if (isOutputSubtree(resolvedFull, absIn, absOut)) continue;
    if (resolvedFull === scriptPath) continue;
    if (resolvedFull.endsWith('.png')) continue;

    const rel =
      scopeKind === 'file'
        ? path.basename(resolvedFull)
        : path.relative(absIn, resolvedFull);
    if (scopeKind === 'dir' && (rel.startsWith('..') || path.isAbsolute(rel)))
      continue;

    const label = buildFlatLabel(rel, sourceLeafPrefix);
    result.push({ rel, label, text: diffText });
  }

  result.sort((a, b) =>
    a.rel.localeCompare(b.rel, undefined, { sensitivity: 'base' }),
  );
  return result;
}

/** 解析第一个参数：文件或目录 */
async function resolveInputPath(inputPath) {
  const absPath = path.resolve(inputPath);
  let stat;
  try {
    stat = await fs.stat(absPath);
  } catch (e) {
    console.error(`路径不存在或无法访问: ${absPath}`, e.message);
    process.exit(1);
  }
  if (stat.isFile()) return { kind: 'file', absPath };
  if (stat.isDirectory()) return { kind: 'dir', absPath };
  console.error(`不支持的类型（仅文件或目录）: ${absPath}`);
  process.exit(1);
}

/** 单个文件 → 合并列表的一项 */
async function collectSingleFile(
  absFilePath,
  pageCount = 1,
  gitContext = null,
) {
  const absFile = path.resolve(absFilePath);
  const rel = path.basename(absFile);
  const sourceLeafPrefix = getSourceLeafPrefix(path.dirname(absFile));
  const pages = Math.max(1, Math.floor(pageCount) || 1);
  const maxBytes =
    pages > 1
      ? Math.min(MAX_BYTES_PER_PAGE * pages, 50 * 1024 * 1024)
      : MAX_BYTES;

  if (absFile === path.resolve(__filename)) {
    console.warn('跳过脚本自身。');
    return { fileEntries: [], sourceLeafPrefix, pageCount: pages };
  }
  if (rel.endsWith('.png')) {
    console.warn('跳过 PNG 文件。');
    return { fileEntries: [], sourceLeafPrefix, pageCount: pages };
  }

  const label = buildFlatLabel(rel, sourceLeafPrefix);

  if (gitContext) {
    const relToGit = path.relative(gitContext.root, absFile);
    const entry = gitContext.changes.get(relToGit);
    if (!entry) {
      console.warn('该文件没有 Git 改动，已跳过。');
      return { fileEntries: [], sourceLeafPrefix, pageCount: pages };
    }
    return {
      fileEntries: [{ rel, label, text: entry.diffText }],
      sourceLeafPrefix,
      pageCount: pages,
    };
  }

  const text = await readFileText(absFile, maxBytes);
  if (text === null) {
    return { fileEntries: [], sourceLeafPrefix, pageCount: pages };
  }

  return {
    fileEntries: [{ rel, label, text }],
    sourceLeafPrefix,
    pageCount: pages,
  };
}

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const positional = [];
  let pageCount = 1;
  let gitOnly = false;
  let singleImage = false;
  let horizontalLayout = false;
  let embedTarget = null;
  let embedOutput = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--pages' || a === '-p') {
      const n = parseInt(args[++i], 10);
      if (!Number.isFinite(n) || n < 1) {
        console.error('--pages 需要为正整数');
        process.exit(1);
      }
      pageCount = n;
      continue;
    }
    if (a === '--git' || a === '-g') {
      gitOnly = true;
      continue;
    }
    if (a === '--single' || a === '-s') {
      singleImage = true;
      continue;
    }
    if (a === '--horizontal' || a === '-H') {
      horizontalLayout = true;
      continue;
    }
    if (a === '--embed' || a === '-e') {
      embedTarget = args[++i];
      if (!embedTarget) {
        console.error('--embed 需要指定目标 PNG 路径');
        process.exit(1);
      }
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        embedOutput = args[++i];
      }
      continue;
    }
    if (a.startsWith('-')) {
      console.error(`未知选项: ${a}`);
      process.exit(1);
    }
    positional.push(a);
  }

  return {
    inputPath: positional[0],
    outputDir: positional[1],
    pageCount,
    gitOnly,
    singleImage,
    horizontalLayout,
    embedTarget,
    embedOutput,
  };
}

async function main() {
  let {
    inputPath,
    outputDir,
    pageCount,
    gitOnly,
    singleImage,
    horizontalLayout,
    embedTarget,
    embedOutput,
  } = parseCliArgs(process.argv);

  if (!inputPath) {
    console.error(
      '用法: node get.js <源目录或文件路径> [输出目录] [--pages N] [--git] [--single] [--horizontal] [--embed <目标PNG> [输出PNG]]\n' +
        '支持传入目录（递归）或单个文件；每个源文件各输出一张 PNG。\n' +
        '单文件可用 --pages N（或 -p N）拆成 N 张图，缓解内容过长或文件过大。\n' +
        '--git（或 -g）仅处理 Git 有改动的文件，展示相对 HEAD 的 diff。\n' +
        '--single（或 -s）将全部文件元数据嵌入一张小 PNG，不渲染文件正文；\n' +
        '  同时将 import / import type 的 from "element-plus" / from \'element-plus\' 改写为 @nbcb/dthr-component-v3-pc，\n' +
        "  将 import BusinessTable from '@/_components/BusinessTable/index.vue' 改写为\n" +
        "  import { ElBusinessTable as BusinessTable } from '@nbcb/dthr-component-v3-pc'，\n" +
        '  将 import { i18n } from "@/locales" 改写为 import i18n from "@/_plugins/i18n"，\n' +
        '  将目录名 pages 改写为 views（含相对路径与 @/pages），\n' +
        '  将 @/_assets/images/ 改写为 @/assets/，\n' +
        '  并将 Object.hasOwn(...) 改写为 Object.prototype.hasOwnProperty.call(...)。\n' +
        '--horizontal（或 -H）固定高度 1080px，内容按列水平排列（超长自动向右续列）。\n' +
        '--embed（或 -e）将源文件元数据写入已有 PNG，不重新渲染图片。\n' +
        '默认输出到项目 output/ 目录；也可指定第二参数为其他输出目录。\n' +
        '示例: node get.js ./src\n' +
        '      node get.js ./src/main.js\n' +
        '      node get.js ./src/main.js ./out --pages 3\n' +
        '      node get.js ./src --git\n' +
        '      node get.js ./src --single\n' +
        '      node get.js ./src --horizontal\n' +
        '      node get.js ./src --embed ./photo.png\n' +
        '      node get.js ./src --embed ./photo.png ./photo-with-meta.png\n' +
        '      node get.js ./src ./custom-out\n' +
        '还原: npm run restore（读元数据） / npm run restore:ocr（OCR 横排图）',
    );
    process.exit(1);
  }

  if (embedTarget && !embedTarget.toLowerCase().endsWith('.png')) {
    console.error('--embed 的目标必须是 .png 文件。');
    process.exit(1);
  }

  if (embedTarget) {
    if (singleImage) {
      console.warn('--embed 模式下忽略 --single。');
    }
    if (horizontalLayout) {
      console.warn('--embed 模式下忽略 --horizontal。');
    }
    if (pageCount > 1) {
      console.warn('--embed 模式下忽略 --pages，将写入完整文件内容。');
    }
    if (outputDir) {
      console.warn(
        '--embed 模式下忽略输出目录参数，请用 --embed 后的第二个路径指定输出 PNG。',
      );
    }
  }

  const absOut = outputDir ? path.resolve(outputDir) : DEFAULT_OUTPUT_DIR;
  const input = await resolveInputPath(inputPath);

  let fileEntries;
  let sourceLeafPrefix;
  let filePageCount = 1;
  const gitContext = gitOnly
    ? await buildGitContext(input.absPath, input.kind)
    : null;

  if (input.kind === 'file') {
    ({
      fileEntries,
      sourceLeafPrefix,
      pageCount: filePageCount,
    } = await collectSingleFile(input.absPath, pageCount, gitContext));
  } else {
    if (pageCount > 1) {
      console.warn('--pages 仅对单个文件生效，目录模式将忽略该选项。');
    }
    if (singleImage && pageCount > 1) {
      console.warn('--single 与 --pages 不能同时使用，已忽略 --pages。');
    }
    if (horizontalLayout && pageCount > 1) {
      console.warn('--horizontal 与 --pages 不能同时使用，已忽略 --pages。');
    }
    if (horizontalLayout && singleImage) {
      console.warn('--horizontal 与 --single 不能同时使用，已忽略 --single。');
      singleImage = false;
    }
    sourceLeafPrefix = getSourceLeafPrefix(input.absPath);
    try {
      fileEntries = gitContext
        ? await collectGitChangedFiles(
            input.absPath,
            input.absPath,
            absOut,
            sourceLeafPrefix,
            gitContext,
            input.kind,
          )
        : await collectFiles(
            input.absPath,
            input.absPath,
            absOut,
            sourceLeafPrefix,
            null,
          );
    } catch (e) {
      console.error(`无法遍历目录: ${input.absPath}`, e.message);
      process.exit(1);
    }
  }

  if (fileEntries.length === 0) {
    console.warn(
      gitOnly
        ? '未找到 Git 改动文件（在指定范围内）。'
        : '未找到可处理的文件。',
    );
    process.exit(0);
  }

  if (singleImage && input.kind === 'file' && filePageCount > 1) {
    console.warn('--single 与 --pages 不能同时使用，已忽略 --pages。');
  }
  if (horizontalLayout && input.kind === 'file' && filePageCount > 1) {
    console.warn('--horizontal 与 --pages 不能同时使用，已忽略 --pages。');
  }
  if (horizontalLayout && singleImage) {
    console.warn('--horizontal 与 --single 不能同时使用，已忽略 --single。');
    singleImage = false;
  }

  const gitHint = gitOnly ? '（仅 Git 改动）' : '';

  if (embedTarget) {
    const absEmbedTarget = path.resolve(embedTarget);
    try {
      const st = await fs.stat(absEmbedTarget);
      if (!st.isFile()) {
        console.error(`--embed 目标不是文件: ${absEmbedTarget}`);
        process.exit(1);
      }
    } catch (e) {
      console.error(`--embed 目标不存在: ${absEmbedTarget}`, e.message);
      process.exit(1);
    }

    console.log(
      `${fileEntries.length} 个文件${gitHint}，正在写入元数据到: ${absEmbedTarget}`,
    );
    const outPath = await writeMetadataToPng(
      absEmbedTarget,
      fileEntries,
      embedOutput ? path.resolve(embedOutput) : absEmbedTarget,
    );
    console.log(`完成。已写入: ${outPath}`);
    console.log(`可用 node image-to-file.js ${outPath} 还原源文件。`);
    return;
  }

  const modeHint = horizontalLayout
    ? input.kind === 'file'
      ? `单文件水平排版（高 ${HORIZONTAL_HEIGHT}px）${gitHint}`
      : `${fileEntries.length} 个文件水平排版（高 ${HORIZONTAL_HEIGHT}px）${gitHint}`
    : singleImage
      ? `${fileEntries.length} 个文件${gitHint}，元数据写入一张图片`
      : input.kind === 'file' && filePageCount > 1
        ? `单文件（拆成 ${filePageCount} 张）${gitHint}`
        : input.kind === 'file'
          ? `单文件${gitHint}`
          : `${fileEntries.length} 个文件${gitHint}`;
  console.log(`${modeHint}，正在生成…`);

  await fs.mkdir(absOut, { recursive: true });

  const measureCanvas = createCanvas(MAX_CANVAS_WIDTH, 400);
  const mctx = measureCanvas.getContext('2d');
  const written = [];
  let truncatedCount = 0;

  if (singleImage) {
    const exportPrefix =
      sourceLeafPrefix === 'pages' ? 'views' : sourceLeafPrefix;
    const layout = planMetadataOnlyLayout(exportPrefix, fileEntries.length);
    let png = renderImage(layout);
    png = embedAllSourcesInPng(
      png,
      fileEntries.map(({ rel, label, text }) =>
        rewriteForIntranetExport({ rel, label, text }),
      ),
    );
    const outPath = path.join(absOut, `${exportPrefix}_all.png`);
    await fs.writeFile(outPath, png);
    written.push(outPath);
    console.log(`已生成: ${outPath}`);
  } else if (horizontalLayout) {
    const layout =
      input.kind === 'file'
        ? planHorizontalSingleFileLayout(
            fileEntries[0].label,
            fileEntries[0].text,
            mctx,
          )
        : planHorizontalMultiFileLayout(fileEntries, mctx);
    let png = renderImage(layout);
    if (input.kind === 'file') {
      const { rel, label, text } = fileEntries[0];
      png = embedSourceInPng(png, {
        rel,
        label,
        text,
        pageIndex: 1,
        pageTotal: 1,
      });
      const outPath = path.join(absOut, `${label}.png`);
      await fs.writeFile(outPath, png);
      written.push(outPath);
      if (layout.truncated) truncatedCount++;
      console.log(
        `已生成: ${outPath}（宽 ${layout.width}px × 高 ${layout.height}px）`,
      );
    } else {
      png = embedAllSourcesInPng(
        png,
        fileEntries.map(({ rel, label, text }) => ({ rel, label, text })),
      );
      const outPath = path.join(absOut, `${sourceLeafPrefix}_horizontal.png`);
      await fs.writeFile(outPath, png);
      written.push(outPath);
      if (layout.truncated) truncatedCount++;
      console.log(
        `已生成: ${outPath}（宽 ${layout.width}px × 高 ${layout.height}px）`,
      );
    }
  } else {
    for (const { rel, label, text } of fileEntries) {
      const usePages = input.kind === 'file' && filePageCount > 1;
      const layouts = usePages
        ? planFilePageLayouts(label, text, mctx, filePageCount)
        : [planSingleFileLayout(label, text, mctx)];
      const pageTotal = layouts.length;

      for (let i = 0; i < layouts.length; i++) {
        const layout = layouts[i];
        let png = renderImage(layout);
        png = embedSourceInPng(png, {
          rel,
          label,
          text,
          pageIndex: i + 1,
          pageTotal,
        });
        const outPath = path.join(
          absOut,
          labelToPngFilename(label, i + 1, pageTotal),
        );
        await fs.writeFile(outPath, png);
        written.push(outPath);
        if (layout.truncated) truncatedCount++;
        console.log(`已生成: ${outPath}`);
      }
    }
  }

  if (truncatedCount > 0) {
    console.warn(
      horizontalLayout
        ? `注意：有 ${truncatedCount} 张图片仍有列内容被截断（高度 ${HORIZONTAL_HEIGHT}px，标题过长时可能发生）。`
        : `注意：有 ${truncatedCount} 个文件因超出画布高度（${MAX_CANVAS_HEIGHT}px）而被截断。`,
    );
  }
  console.log(`完成。共 ${written.length} 张图片，输出目录: ${absOut}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
// test change
