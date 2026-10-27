#!/usr/bin/env node
/**
 * 从 --horizontal 生成的横排 PNG（或手机拍摄的同类截图）OCR 还原源码。
 * 依赖 macOS Vision（通过 ocr-vision.swift / .bin/ocr-vision）。
 *
 * 用法:
 *   node horizontal-ocr-to-file.js [图片文件或目录] [输出目录]
 *
 * 示例:
 *   node horizontal-ocr-to-file.js
 *   node horizontal-ocr-to-file.js ./output
 *   node horizontal-ocr-to-file.js ./output/xxx_horizontal.png ./restored-ocr
 *   npm run restore:ocr
 *
 * 支持格式: png / jpg / jpeg / webp / heic / heif（iPhone 照片可直接放 output/）。
 * 未指定输入时默认读取 output/：
 *   - 有 *_horizontal.png 时优先用它；
 *   - 否则处理目录内全部图片（多张手机拍照会依次 OCR 并合并）。
 * 未指定输出目录时还原到 restored-ocr/（运行前会清空）。
 *
 * 说明:
 * - 这是 OCR 近似还原，代码符号/缩进可能有误差；有嵌入元数据时请优先用 npm run restore。
 * - 按列聚类文字块，识别列标题（▸ label），续列 label (2) 会自动拼接。
 */

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|heic|heif)$/i;
const HEIC_EXT_RE = /\.(heic|heif)$/i;

const fs = require('fs/promises');
const path = require('path');
const { execFile, spawnSync } = require('child_process');
const { promisify } = require('util');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const execFileAsync = promisify(execFile);

const DEFAULT_INPUT_DIR = path.join(__dirname, 'output');
const DEFAULT_RESTORE_DIR = path.join(__dirname, 'restored-ocr');
const SWIFT_SRC = path.join(__dirname, 'ocr-vision.swift');
const OCR_BIN = path.join(__dirname, '.bin', 'ocr-vision');

/** 与 get.js --horizontal 一致的逻辑尺寸（未乘 RENDER_SCALE） */
const HORIZONTAL_HEIGHT = 1080;
const HORIZONTAL_COLUMN_WIDTH = 480;
const HORIZONTAL_COLUMN_GAP = 20;
const PADDING = 24;

function parseCliArgs(argv) {
  const positional = [];
  for (const a of argv.slice(2)) {
    if (a.startsWith('-')) {
      console.error(`未知选项: ${a}`);
      process.exit(1);
    }
    positional.push(a);
  }
  return {
    inputPath: positional[0],
    outputDir: positional[1],
  };
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** 确保 Vision OCR 二进制可用（首次自动编译） */
async function ensureOcrBinary() {
  if (!(await pathExists(SWIFT_SRC))) {
    console.error(`缺少 OCR 源文件: ${SWIFT_SRC}`);
    process.exit(1);
  }

  let needBuild = !(await pathExists(OCR_BIN));
  if (!needBuild) {
    try {
      const [binStat, srcStat] = await Promise.all([
        fs.stat(OCR_BIN),
        fs.stat(SWIFT_SRC),
      ]);
      if (srcStat.mtimeMs > binStat.mtimeMs) needBuild = true;
    } catch {
      needBuild = true;
    }
  }

  if (!needBuild) return OCR_BIN;

  console.log('首次编译 macOS Vision OCR 工具…');
  await fs.mkdir(path.dirname(OCR_BIN), { recursive: true });
  try {
    await execFileAsync('swiftc', ['-O', '-o', OCR_BIN, SWIFT_SRC], {
      maxBuffer: 4 * 1024 * 1024,
    });
  } catch (e) {
    console.error(
      '编译 ocr-vision 失败。请确认已安装 Xcode Command Line Tools（xcode-select --install）。\n' +
        (e.stderr || e.message),
    );
    process.exit(1);
  }
  console.log(`已生成: ${OCR_BIN}`);
  return OCR_BIN;
}

/**
 * 暗色代码图反相成黑字白底，并轻微放大，提升 Vision 识别率。
 * @returns {Promise<string>} 预处理后的临时文件路径；若无需处理则返回原路径
 */
async function preprocessForOcr(imagePath, tmpDir, tag) {
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const { width, height } = img;
  const sample = ctx.getImageData(
    0,
    0,
    Math.min(width, 80),
    Math.min(height, 80),
  ).data;
  let sum = 0;
  const n = sample.length / 4;
  for (let i = 0; i < sample.length; i += 4) {
    sum += (sample[i] + sample[i + 1] + sample[i + 2]) / 3;
  }
  const avg = sum / n;
  const isDark = avg < 100;

  if (!isDark) return imagePath;

  const src = ctx.getImageData(0, 0, width, height);
  const d = src.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i];
    d[i + 1] = 255 - d[i + 1];
    d[i + 2] = 255 - d[i + 2];
  }
  ctx.putImageData(src, 0, 0);

  // 略放大，利于细小符号
  const scale = 1.5;
  const out = createCanvas(
    Math.round(width * scale),
    Math.round(height * scale),
  );
  const octx = out.getContext('2d');
  octx.imageSmoothingEnabled = true;
  octx.drawImage(canvas, 0, 0, out.width, out.height);

  await fs.mkdir(tmpDir, { recursive: true });
  const outPath = path.join(tmpDir, `${tag}-invert.png`);
  await fs.writeFile(outPath, out.toBuffer('image/png'));
  return outPath;
}

/** 将同一视觉行、且 X 相邻的识别框合并（不跨列，避免多列表头粘成一行） */
function mergeLinesByRow(lines) {
  if (!lines.length) return [];
  const sorted = [...lines].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 0.006) return a.y - b.y;
    return a.x - b.x;
  });

  const rows = [];
  let current = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = current[0];
    const line = sorted[i];
    const yTol = Math.max(0.006, (prev.h + line.h) * 0.45);
    if (Math.abs(line.y - prev.y) <= yTol) {
      current.push(line);
    } else {
      rows.push(current);
      current = [line];
    }
  }
  rows.push(current);

  const merged = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    let group = [row[0]];
    for (let i = 1; i < row.length; i++) {
      const prev = group[group.length - 1];
      const cur = row[i];
      const gap = cur.x - (prev.x + prev.w);
      // 间距过大视为另一列，不合并
      if (gap > 0.04) {
        merged.push(group);
        group = [cur];
      } else {
        group.push(cur);
      }
    }
    merged.push(group);
  }

  return merged.map((boxes) => {
    boxes.sort((a, b) => a.x - b.x);
    const text = boxes
      .map((b) => b.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?})\]`])/g, '$1')
      .replace(/([({[`])\s+/g, '$1');
    const { x } = boxes[0];
    const y = Math.min(...boxes.map((b) => b.y));
    const right = Math.max(...boxes.map((b) => b.x + b.w));
    const bottom = Math.max(...boxes.map((b) => b.y + b.h));
    const confidence =
      boxes.reduce((s, b) => s + (b.confidence || 0), 0) / boxes.length;
    return {
      text,
      x,
      y,
      w: right - x,
      h: bottom - y,
      confidence,
    };
  });
}

/** HEIC/HEIF → PNG（canvas 不支持 HEIC；Vision 虽可读，但预处理需 PNG） */
async function ensureRasterImage(imagePath, tmpDir) {
  if (!HEIC_EXT_RE.test(imagePath))
    return { path: imagePath, temporary: false };

  await fs.mkdir(tmpDir, { recursive: true });
  const base = path.basename(imagePath).replace(HEIC_EXT_RE, '');
  const outPath = path.join(tmpDir, `${base}.png`);
  try {
    await execFileAsync(
      'sips',
      ['-s', 'format', 'png', imagePath, '--out', outPath],
      {
        maxBuffer: 4 * 1024 * 1024,
      },
    );
  } catch (e) {
    console.error(
      `HEIC 转 PNG 失败（需要 macOS sips）: ${imagePath}\n${e.stderr || e.message}`,
    );
    process.exit(1);
  }
  return { path: outPath, temporary: true };
}

async function runOcr(imagePath, options = {}) {
  const bin = await ensureOcrBinary();
  const tmpDir = options.tmpDir || path.join(__dirname, '.tmp-ocr');
  const tag = options.tag || 'img';
  const temps = [];

  try {
    const raster = await ensureRasterImage(imagePath, tmpDir);
    if (raster.temporary) temps.push(raster.path);

    const prepared = await preprocessForOcr(raster.path, tmpDir, tag);
    if (prepared !== raster.path) temps.push(prepared);

    const { stdout } = await execFileAsync(bin, [prepared], {
      maxBuffer: 32 * 1024 * 1024,
    });
    const result = JSON.parse(stdout);
    result.lines = mergeLinesByRow(result.lines || []);
    return result;
  } catch (e) {
    const detail = e.stderr || e.message;
    console.error(`OCR 失败: ${imagePath}\n${detail}`);
    process.exit(1);
  } finally {
    for (const p of temps) {
      try {
        await fs.unlink(p);
      } catch {
        /* ignore */
      }
    }
  }
}

async function collectImageFiles(inputPath) {
  const abs = path.resolve(inputPath);
  let stat;
  try {
    stat = await fs.stat(abs);
  } catch (e) {
    console.error(`路径不存在: ${abs}`, e.message);
    process.exit(1);
  }

  if (stat.isFile()) {
    if (!IMAGE_EXT_RE.test(abs)) {
      console.error('请传入图片文件（png/jpg/webp/heic/heif）或目录。');
      process.exit(1);
    }
    return [abs];
  }

  if (!stat.isDirectory()) {
    console.error('仅支持图片文件或目录。');
    process.exit(1);
  }

  const result = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === '.DS_Store') continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (
          ent.name === 'restored' ||
          ent.name === 'restored-ocr' ||
          ent.name === 'node_modules' ||
          ent.name.startsWith('.')
        ) {
          continue;
        }
        await walk(full);
      } else if (ent.isFile() && IMAGE_EXT_RE.test(ent.name)) {
        result.push(full);
      }
    }
  }
  await walk(abs);
  result.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return result;
}

/**
 * 选择要处理的图片列表：
 * - 单文件：仅该文件
 * - 目录内有 *_horizontal.png：只用第一张 horizontal
 * - 否则：处理全部（适合多张手机拍照）
 */
function pickTargetImages(imagePaths, inputIsFile) {
  if (!imagePaths.length) return [];
  if (inputIsFile) return [imagePaths[0]];

  const horizontal = imagePaths.filter((p) =>
    /_horizontal\.png$/i.test(path.basename(p)),
  );
  if (horizontal.length) return [horizontal[0]];
  return imagePaths;
}

/**
 * 将 OCR 行按 x 聚类成列。
 * get.js 原生图列宽固定；拍照图用间距自适应。
 */
function clusterColumns(lines, imageWidthLogic) {
  if (!lines.length) return [];

  const centers = lines
    .map((l, i) => ({ i, cx: l.x + l.w / 2, line: l }))
    .sort((a, b) => a.cx - b.cx);

  // 估计列间距阈值：原生横图约 columnWidth/imageWidth
  const expectedColSpan =
    (HORIZONTAL_COLUMN_WIDTH + HORIZONTAL_COLUMN_GAP) /
    Math.max(imageWidthLogic, HORIZONTAL_COLUMN_WIDTH);
  const gapThreshold = Math.max(0.045, expectedColSpan * 0.35);

  const clusters = [];
  let current = [centers[0]];

  for (let i = 1; i < centers.length; i++) {
    const prev = current[current.length - 1];
    const gap = centers[i].cx - prev.cx;
    if (gap > gapThreshold) {
      clusters.push(current);
      current = [centers[i]];
    } else {
      current.push(centers[i]);
    }
  }
  clusters.push(current);

  return clusters.map((items) => {
    const colLines = items
      .map((x) => x.line)
      .sort((a, b) => {
        if (Math.abs(a.y - b.y) > 0.006) return a.y - b.y;
        return a.x - b.x;
      });
    const meanX =
      colLines.reduce((s, l) => s + l.x + l.w / 2, 0) / colLines.length;
    return { meanX, lines: colLines };
  });
}

/** 识别列标题：▸ label / > label / • label / O label 等 */
function parseColumnTitle(text) {
  const t = String(text || '').trim();
  if (!t) return null;

  // 常见 OCR 对 ▸ 的误识别（含手机拍照时的 O / 0）
  const m = t.match(/^[▸►▶➢❯>›·•●○◯O0\-—–]\s+(.+)$/);
  if (m) return cleanupTitle(m[1]);

  const m2 = t.match(/^[▸►▶➢❯>›·•●○◯\-—–](.+)$/);
  if (m2) return cleanupTitle(m2[1]);

  // 无前缀但像平铺文件名：xxx_yyy.ext 或 xxx_yyy.ext (2)
  if (/^[\w.-]+\.[A-Za-z0-9]+(\s*\(\d+\))?$/.test(t)) {
    return cleanupTitle(t);
  }
  if (/^[\w.-]+(\s*\(\d+\))?$/.test(t) && t.includes('_')) {
    return cleanupTitle(t);
  }
  return null;
}

/** 合并多张图还原出的文件 Map（同名按 part 拼接，同 part 追加） */
function mergeFileMaps(target, source) {
  for (const [key, entry] of source) {
    if (!target.has(key)) {
      target.set(key, { label: entry.label, parts: new Map(entry.parts) });
      continue;
    }
    const dest = target.get(key);
    for (const [part, body] of entry.parts) {
      const prev = dest.parts.get(part) || '';
      dest.parts.set(part, prev ? `${prev}\n${body}` : body);
    }
  }
  return target;
}

async function ocrImageToFileMap(imagePath) {
  let ocrResult = null;
  // 原生 PNG 横图才尝试按列裁切；HEIC 拍照图走整图 OCR
  if (!HEIC_EXT_RE.test(imagePath)) {
    ocrResult = await maybeSplitNativeHorizontal(imagePath);
  }
  if (!ocrResult) {
    console.log('整图 OCR 中…');
    ocrResult = await runOcr(imagePath);
  }

  const lines = ocrResult.lines || [];
  if (!lines.length) {
    console.warn(`未识别到文字: ${imagePath}`);
    return new Map();
  }

  console.log(`识别到 ${lines.length} 行文字，正在按列聚类…`);
  const logicWidth =
    ocrResult.width / (ocrResult.height / HORIZONTAL_HEIGHT) || ocrResult.width;
  const columns = clusterColumns(lines, logicWidth);
  console.log(`共 ${columns.length} 列`);
  return buildFilesFromColumns(columns);
}

function cleanupTitle(raw) {
  let t = String(raw)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+\((\d+)\)\s*$/, ' ($1)');

  // 若误把多列表头粘在一起，只保留第一段文件名
  const firstFile = t.match(/^([\w.-]+\.[A-Za-z0-9]+)(?:\s*\((\d+)\))?/);
  if (firstFile) {
    return firstFile[2] ? `${firstFile[1]} (${firstFile[2]})` : firstFile[1];
  }
  return t;
}

function splitLabelAndPart(title) {
  const m = title.match(/^(.*?)(?:\s*\((\d+)\))\s*$/);
  if (!m) return { base: title, part: 1 };
  return { base: m[1].trim(), part: parseInt(m[2], 10) || 1 };
}

/** 横排渲染时的软换行：仅在明显被列宽截断时拼回一行 */
function looksLikeSoftWrap(prev, next) {
  const p = String(prev || '').trimEnd();
  const n = String(next || '').trimStart();
  if (!p || !n) return false;
  if (/部分列内容已截断|^…/.test(n)) return false;

  // 下一行像独立语法单元，不拼
  if (
    /^(<\/?|[<:]|v-|const |let |var |function |import |export |return |if |else|type |interface |class |enum |\/\/|\/\*|\*|append-|destroy-|clearable|filterable|border|width=|row-key|style=)/i.test(
      n,
    )
  ) {
    return false;
  }

  // CamelCase 被拦腰截断：applyD + etailTitle
  if (/[A-Z]$/.test(p) && /^[a-z]/.test(n)) return true;

  // 引号未闭合
  const quoteCount = (p.match(/['"`]/g) || []).length;
  if (quoteCount % 2 === 1) return true;

  // 路径/属性值连点截断：foo. + bar
  if (/\.$/.test(p) && /^[A-Za-z_]/.test(n)) return true;

  return false;
}

function joinSoftWrappedLines(texts) {
  const out = [];
  for (const raw of texts) {
    const line = String(raw || '');
    if (!out.length) {
      out.push(line);
      continue;
    }
    const prev = out[out.length - 1];
    if (looksLikeSoftWrap(prev, line)) {
      out[out.length - 1] = prev.replace(/\s+$/, '') + line.trimStart();
    } else {
      out.push(line);
    }
  }
  return out;
}

/** 去掉标题行，拼正文；尽量保留行结构 */
function columnBodyText(colLines, titleIndex) {
  const body = colLines
    .slice(titleIndex + 1)
    .map((l) => l.text)
    .filter((t) => !/部分列内容已截断/.test(t))
    .filter((t) => !/^…/.test(t.trim()))
    // 过滤明显噪声
    .filter((t) => !/^[*＊]\s*[Жж*＊\d\s]*$/.test(t.trim()));

  return joinSoftWrappedLines(body).join('\n');
}

/**
 * 从聚类列还原多个文件
 * @returns {Map<string, { label: string, parts: Map<number, string> }>}
 */
function buildFilesFromColumns(columns) {
  const files = new Map();

  for (const col of columns) {
    let title = null;
    let titleIndex = -1;

    for (let i = 0; i < Math.min(col.lines.length, 4); i++) {
      const parsed = parseColumnTitle(col.lines[i].text);
      if (parsed) {
        title = parsed;
        titleIndex = i;
        break;
      }
    }

    if (!title) {
      // 无标题时用列序号占位，避免丢内容
      title = `column_${String(files.size + 1).padStart(2, '0')}.txt`;
      titleIndex = -1;
      console.warn(`未识别到列标题，写入: ${title}`);
    }

    const { base, part } = splitLabelAndPart(title);
    const body = columnBodyText(col.lines, titleIndex);

    if (!files.has(base)) {
      files.set(base, { label: base, parts: new Map() });
    }
    const entry = files.get(base);
    const prev = entry.parts.get(part) || '';
    entry.parts.set(part, prev ? `${prev}\n${body}` : body);
  }

  return files;
}

/** 平铺 label → 尽量还原相对路径（启发式） */
function labelToRelPath(label) {
  const safe = label.replace(/[/\\]/g, '_').trim();
  if (!safe || safe.includes('..')) return null;

  // 已有扩展名时：保留最后一个片段为文件名，前面的 _ 尝试还原目录
  // 例如 sequence_components_dialog.vue → sequence/components/dialog.vue（启发式，可能不准）
  const extMatch = safe.match(/^(.+)(\.[A-Za-z0-9]+)$/);
  if (!extMatch) return safe;

  const stem = extMatch[1];
  const ext = extMatch[2];
  const parts = stem.split('_').filter(Boolean);
  if (parts.length <= 1) return safe;

  // 常见：首段是源根目录名（sourceLeafPrefix），还原时去掉
  // 多段时除最后一段外当目录
  const fileName = parts[parts.length - 1] + ext;
  const dirs = parts.slice(0, -1);
  return path.join(...dirs, fileName);
}

/**
 * 对超宽原生横图按列裁切后再 OCR，提升长图准确度。
 * 高度接近 1080/2160 且宽度明显大于单列时启用。
 */
async function maybeSplitNativeHorizontal(imagePath) {
  const img = await loadImage(imagePath);
  const w = img.width;
  const h = img.height;
  const scale = h / HORIZONTAL_HEIGHT;
  const isNativeHeight =
    Math.abs(h - HORIZONTAL_HEIGHT) < 4 ||
    Math.abs(h - HORIZONTAL_HEIGHT * 2) < 8 ||
    (scale > 0.9 && scale < 2.2 && Math.abs(scale - Math.round(scale)) < 0.08);

  const colPitch =
    (HORIZONTAL_COLUMN_WIDTH + HORIZONTAL_COLUMN_GAP) * (h / HORIZONTAL_HEIGHT);
  const pad = PADDING * (h / HORIZONTAL_HEIGHT);
  const approxCols = Math.round(
    (w - pad * 2 + HORIZONTAL_COLUMN_GAP * (h / HORIZONTAL_HEIGHT)) / colPitch,
  );

  if (!isNativeHeight || approxCols < 2 || w < colPitch * 1.5) {
    return null;
  }

  const s = h / HORIZONTAL_HEIGHT;
  const colW = Math.round(HORIZONTAL_COLUMN_WIDTH * s);
  const gap = Math.round(HORIZONTAL_COLUMN_GAP * s);
  const padding = Math.round(PADDING * s);
  const count = Math.max(1, Math.round((w - padding * 2 + gap) / (colW + gap)));

  console.log(`检测到原生横排布局，按 ${count} 列裁切后分别 OCR…`);

  const tmpDir = path.join(__dirname, '.tmp-ocr-cols');
  await fs.rm(tmpDir, { recursive: true, force: true });
  await fs.mkdir(tmpDir, { recursive: true });

  const allLines = [];
  try {
    for (let i = 0; i < count; i++) {
      const x0 = padding + i * (colW + gap);
      const cropW = Math.min(colW, w - x0);
      if (cropW < 20) continue;

      const canvas = createCanvas(cropW, h);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, x0, 0, cropW, h, 0, 0, cropW, h);
      const colTag = `col_${String(i + 1).padStart(2, '0')}`;
      const colPath = path.join(tmpDir, `${colTag}.png`);
      await fs.writeFile(colPath, canvas.toBuffer('image/png'));

      const result = await runOcr(colPath, { tmpDir, tag: colTag });
      const xOffset = x0 / w;
      const xScale = cropW / w;
      for (const line of result.lines || []) {
        allLines.push({
          ...line,
          x: xOffset + line.x * xScale,
          w: line.w * xScale,
        });
      }
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }

  return { width: w, height: h, lines: allLines };
}

async function removeDirIfExists(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

async function writeRestoredFiles(fileMap, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });
  const written = [];

  for (const { label, parts } of fileMap.values()) {
    const ordered = [...parts.entries()].sort((a, b) => a[0] - b[0]);
    const text = ordered
      .map(([, body]) => body.replace(/\s+$/g, ''))
      .filter(Boolean)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    const rel = labelToRelPath(label);
    if (!rel) {
      console.warn(`跳过非法名称: ${label}`);
      continue;
    }

    const outPath = path.join(outputDir, rel);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(
      outPath,
      text.endsWith('\n') ? text : `${text}\n`,
      'utf8',
    );
    written.push(outPath);
    console.log(`已还原: ${outPath}`);
  }

  return written;
}

async function main() {
  if (process.platform !== 'darwin') {
    console.error('当前 OCR 脚本依赖 macOS Vision，仅支持在 macOS 上运行。');
    process.exit(1);
  }

  // 探测 swiftc
  const swiftc = spawnSync('swiftc', ['--version'], { encoding: 'utf8' });
  if (swiftc.status !== 0) {
    console.error(
      '未找到 swiftc，请先安装 Xcode Command Line Tools：xcode-select --install',
    );
    process.exit(1);
  }

  const { inputPath, outputDir } = parseCliArgs(process.argv);
  const absIn = inputPath ? path.resolve(inputPath) : DEFAULT_INPUT_DIR;
  const absOut = outputDir ? path.resolve(outputDir) : DEFAULT_RESTORE_DIR;

  const images = await collectImageFiles(absIn);
  if (images.length === 0) {
    console.warn(
      '未找到图片文件。\n' +
        `请将 png/jpg/webp/heic 放到: ${absIn}\n` +
        '示例: npm run restore:ocr -- ./output/IMG_7087.heic',
    );
    process.exit(0);
  }

  const inputIsFile = (await fs.stat(absIn)).isFile();
  const targets = pickTargetImages(images, inputIsFile);

  console.log(
    `待 OCR ${targets.length} 张图片（目录内共发现 ${images.length} 张）`,
  );
  for (const t of targets) console.log(`  - ${t}`);

  console.log(`清空输出目录: ${absOut}`);
  await removeDirIfExists(absOut);

  const fileMap = new Map();
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] ${path.basename(target)}`);
    const partMap = await ocrImageToFileMap(target);
    mergeFileMaps(fileMap, partMap);
  }

  if (fileMap.size === 0) {
    console.warn('未识别到任何可还原内容。');
    process.exit(1);
  }

  const written = await writeRestoredFiles(fileMap, absOut);

  console.log(
    `\n完成。共还原 ${written.length} 个文件，输出目录: ${absOut}\n` +
      '提示：OCR 可能有符号误差；若 PNG 由本工具 get.js 生成且含元数据，请优先使用 npm run restore。',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
