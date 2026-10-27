#!/usr/bin/env node
/**
 * 从 get.js 生成的 PNG 中还原源文件（读取嵌入的 iTXt 元数据）。
 * 元数据由 get.js 生成时嵌入，或通过 get.js --embed 写入已有 PNG。
 *
 * 用法:
 *   node image-to-file.js [PNG 文件或目录] [输出目录]
 *
 * 示例:
 *   node image-to-file.js
 *   node image-to-file.js ./output
 *   node image-to-file.js ./output ./restored
 *   node image-to-file.js ./output/popover_demo_index.vue.png
 *
 * 未指定输入时默认读取项目下的 output/，并只解析其中第一张 PNG。
 * 未指定输出目录时，还原到项目下的 restored/ 目录（运行前会先清空该目录）。
 * 多页 PNG（文件名带 _01、_02 等后缀）会按页序合并为同一文件（元数据含完整正文时取首页即可）。
 * 合并单图（get.js --single）使用 v2 元数据，一张 PNG 可还原多个源文件。
 */

const fs = require('fs/promises');
const path = require('path');
const zlib = require('zlib');

const PAYLOAD_KEYWORD = 'SourcePayload';
const DEFAULT_INPUT_DIR = path.join(__dirname, 'output');
const DEFAULT_RESTORE_DIR = path.join(__dirname, 'restored');

/** CRC-32（PNG 规范） */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function readChunkType(buf, offset) {
  return buf.toString('ascii', offset, offset + 4);
}

/** 遍历 PNG 所有 chunk */
function* iteratePngChunks(buf) {
  if (buf.length < 8 || buf.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    throw new Error('不是有效的 PNG 文件');
  }
  let offset = 8;
  while (offset + 12 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = readChunkType(buf, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > buf.length) break;
    const data = buf.subarray(dataStart, dataEnd);
    yield { type, data, offset };
    offset = dataEnd + 4;
    if (type === 'IEND') break;
  }
}

/** 解析 iTXt：返回 { keyword, text } 或 null */
function parseITxtChunk(data) {
  let i = 0;
  while (i < data.length && data[i] !== 0) i++;
  if (i >= data.length) return null;
  const keyword = data.toString('latin1', 0, i);
  i++;
  if (i + 2 > data.length) return null;
  const compressed = data[i] === 1;
  i += 2;
  while (i < data.length && data[i] !== 0) i++;
  i++;
  while (i < data.length && data[i] !== 0) i++;
  i++;
  const textBuf = data.subarray(i);
  let text;
  if (compressed) {
    try {
      text = zlib.inflateSync(textBuf).toString('utf8');
    } catch {
      return null;
    }
  } else {
    text = textBuf.toString('utf8');
  }
  return { keyword, text };
}

/** 从 PNG 读取全部 iTXt / tEXt 元数据 */
function readPngTextChunks(buf) {
  const out = new Map();
  for (const { type, data } of iteratePngChunks(buf)) {
    if (type === 'iTXt') {
      const parsed = parseITxtChunk(data);
      if (parsed) out.set(parsed.keyword, parsed.text);
      continue;
    }
    if (type === 'tEXt') {
      const nul = data.indexOf(0);
      if (nul === -1) continue;
      const keyword = data.toString('latin1', 0, nul);
      const text = data.toString('latin1', nul + 1);
      out.set(keyword, text);
    }
  }
  return out;
}

function buildITxtChunk(keyword, text, compress = true) {
  const keywordBuf = Buffer.from(keyword, 'latin1');
  const textBuf = Buffer.from(text, 'utf8');
  const payload = compress ? zlib.deflateSync(textBuf) : textBuf;
  const parts = [
    keywordBuf,
    Buffer.from([0]),
    Buffer.from([compress ? 1 : 0, 0]),
    Buffer.from([0]),
    Buffer.from([0]),
    payload,
  ];
  const data = Buffer.concat(parts);
  const type = Buffer.from('iTXt');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcVal = crc32(Buffer.concat([type, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal);
  return Buffer.concat([length, type, data, crcBuf]);
}

/** 移除已有 SourcePayload iTXt chunk，避免重复嵌入 */
function stripSourcePayloadFromPng(pngBuf) {
  const signature = pngBuf.subarray(0, 8);
  const kept = [];
  let offset = 8;

  while (offset + 12 <= pngBuf.length) {
    const length = pngBuf.readUInt32BE(offset);
    const type = readChunkType(pngBuf, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (chunkEnd > pngBuf.length) break;

    if (type === 'iTXt') {
      const parsed = parseITxtChunk(pngBuf.subarray(dataStart, dataEnd));
      if (parsed?.keyword === PAYLOAD_KEYWORD) {
        offset = chunkEnd;
        continue;
      }
    }

    kept.push(pngBuf.subarray(offset, chunkEnd));
    offset = chunkEnd;
    if (type === 'IEND') break;
  }

  return Buffer.concat([signature, ...kept]);
}

/** 在 IEND 前插入 iTXt chunk */
function insertChunkBeforeIend(pngBuf, chunkBuf) {
  let iendOffset = -1;
  for (const { type, offset } of iteratePngChunks(pngBuf)) {
    if (type === 'IEND') {
      iendOffset = offset;
      break;
    }
  }
  if (iendOffset < 0) throw new Error('PNG 缺少 IEND');
  return Buffer.concat([
    pngBuf.subarray(0, iendOffset),
    chunkBuf,
    pngBuf.subarray(iendOffset),
  ]);
}

/**
 * 将源文件信息嵌入 PNG（供 get.js 调用）
 * @param {Buffer} pngBuf
 * @param {{ rel: string, label: string, text: string, pageIndex?: number, pageTotal?: number }} meta
 */
function embedSourceInPng(pngBuf, meta) {
  const base = stripSourcePayloadFromPng(pngBuf);
  const payload = JSON.stringify({
    v: 1,
    rel: meta.rel,
    label: meta.label,
    text: meta.text,
    pageIndex: meta.pageIndex ?? 1,
    pageTotal: meta.pageTotal ?? 1,
  });
  const chunk = buildITxtChunk(PAYLOAD_KEYWORD, payload, true);
  return insertChunkBeforeIend(base, chunk);
}

/**
 * 将全部源文件元数据嵌入一张 PNG（v2 格式）
 * @param {Buffer} pngBuf
 * @param {Array<{ rel: string, label: string, text: string }>} files
 */
function embedAllSourcesInPng(pngBuf, files) {
  const base = stripSourcePayloadFromPng(pngBuf);
  const payload = JSON.stringify({
    v: 2,
    files: files.map(({ rel, label, text }) => ({
      rel,
      label,
      text,
    })),
  });
  const chunk = buildITxtChunk(PAYLOAD_KEYWORD, payload, true);
  return insertChunkBeforeIend(base, chunk);
}

/**
 * 将源文件元数据写入已有 PNG 并保存
 * @param {string} pngPath 目标 PNG 路径
 * @param {Array<{ rel: string, label: string, text: string }>} files
 * @param {string} [outputPath] 输出路径，默认覆盖原文件
 * @returns {Promise<string>} 实际写入的路径
 */
async function writeMetadataToPng(pngPath, files, outputPath) {
  if (!files.length) {
    throw new Error('没有可写入的源文件元数据');
  }
  const absPng = path.resolve(pngPath);
  const absOut = path.resolve(outputPath || absPng);
  const pngBuf = await fs.readFile(absPng);
  const result =
    files.length === 1
      ? embedSourceInPng(pngBuf, {
          rel: files[0].rel,
          label: files[0].label,
          text: files[0].text,
          pageIndex: 1,
          pageTotal: 1,
        })
      : embedAllSourcesInPng(pngBuf, files);
  await fs.mkdir(path.dirname(absOut), { recursive: true });
  await fs.writeFile(absOut, result);
  return absOut;
}

function normalizeSourceEntry(data) {
  return {
    rel: String(data.rel ?? ''),
    label: String(data.label ?? ''),
    text: data.text,
    pageIndex: Number(data.pageIndex) || 1,
    pageTotal: Number(data.pageTotal) || 1,
  };
}

/**
 * 从 PNG 提取全部源文件元数据（兼容 v1 单文件与 v2 多文件）
 * @returns {Array<{ rel: string, label: string, text: string, pageIndex: number, pageTotal: number }>}
 */
function extractAllSourcesFromPng(pngBuf) {
  const chunks = readPngTextChunks(pngBuf);
  const raw = chunks.get(PAYLOAD_KEYWORD);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!data) return [];
    if (data.v === 2 && Array.isArray(data.files)) {
      return data.files
        .filter((f) => f && typeof f.text === 'string')
        .map((f) => normalizeSourceEntry(f));
    }
    if (data.v === 1 && typeof data.text === 'string') {
      return [normalizeSourceEntry(data)];
    }
  } catch {
    /* ignore */
  }
  return [];
}

/**
 * 从 PNG 提取源文件元数据（v1 单文件，向后兼容）
 * @returns {{ rel: string, label: string, text: string, pageIndex: number, pageTotal: number } | null}
 */
function extractSourceFromPng(pngBuf) {
  const all = extractAllSourcesFromPng(pngBuf);
  return all.length === 1 ? all[0] : all.length > 1 ? all[0] : null;
}

/** 解析平铺文件名：popover_demo_index.vue.png → { label, pageIndex, pageTotal } */
function parsePngFilename(filename) {
  const base = path.basename(filename, '.png');
  const pageMatch = base.match(/^(.+)_(\d+)$/);
  if (pageMatch) {
    return {
      label: pageMatch[1],
      pageIndex: parseInt(pageMatch[2], 10),
      pageTotal: null,
    };
  }
  return { label: base, pageIndex: 1, pageTotal: 1 };
}

async function collectPngFiles(inputPath) {
  const abs = path.resolve(inputPath);
  let stat;
  try {
    stat = await fs.stat(abs);
  } catch (e) {
    console.error(`路径不存在: ${abs}`, e.message);
    process.exit(1);
  }

  if (stat.isFile()) {
    if (!abs.toLowerCase().endsWith('.png')) {
      console.error('请传入 .png 文件或包含 PNG 的目录。');
      process.exit(1);
    }
    return [abs];
  }

  if (!stat.isDirectory()) {
    console.error('仅支持 PNG 文件或目录。');
    process.exit(1);
  }

  const result = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === '.DS_Store') continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.png')) {
        result.push(full);
      }
    }
  }
  await walk(abs);
  result.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return result;
}

/**
 * 按 label 分组多页 PNG，合并元数据
 * @returns {Map<string, { rel: string, label: string, text: string }>}
 */
async function buildRestoreMap(pngPaths) {
  const groups = new Map();

  for (const pngPath of pngPaths) {
    const buf = await fs.readFile(pngPath);
    const sources = extractAllSourcesFromPng(buf);
    const { label, pageIndex } = parsePngFilename(pngPath);

    if (sources.length === 0) {
      console.warn(
        `跳过（无嵌入元数据，请用新版 get.js 重新生成）: ${pngPath}`,
      );
      continue;
    }

    for (const meta of sources) {
      const key = meta.label || label;
      if (!groups.has(key)) {
        groups.set(key, { rel: meta.rel, label: key, pages: [] });
      }
      const group = groups.get(key);
      if (meta.rel && !group.rel) group.rel = meta.rel;
      group.pages.push({
        pageIndex: meta.pageIndex || pageIndex,
        text: meta.text,
        path: pngPath,
      });
    }
  }

  const restored = new Map();
  for (const [key, group] of groups) {
    group.pages.sort((a, b) => a.pageIndex - b.pageIndex);
    const rel = group.rel || key;
    const fullText = group.pages[0].text;
    const multiSlice =
      group.pages.length > 1 &&
      group.pages.some((p, i) => i > 0 && p.text !== group.pages[0].text);
    if (multiSlice) {
      const merged = group.pages.map((p) => p.text).join('');
      restored.set(key, { rel, label: key, text: merged });
    } else {
      restored.set(key, { rel, label: key, text: fullText });
    }
  }
  return restored;
}

async function writeRestoredFiles(restoreMap, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });
  const written = [];

  for (const { rel, text } of restoreMap.values()) {
    const safeRel = rel.replace(/^[/\\]+/, '');
    if (!safeRel || safeRel.includes('..')) {
      console.warn(`跳过非法相对路径: ${rel}`);
      continue;
    }
    const outPath = path.join(outputDir, safeRel);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, text, 'utf8');
    written.push(outPath);
    console.log(`已还原: ${outPath}`);
  }

  return written;
}

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const positional = [];
  for (const a of args) {
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

async function removeDirIfExists(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

async function main() {
  const { inputPath, outputDir } = parseCliArgs(process.argv);

  const absIn = inputPath ? path.resolve(inputPath) : DEFAULT_INPUT_DIR;
  const absOut = outputDir ? path.resolve(outputDir) : DEFAULT_RESTORE_DIR;
  const pngPaths = await collectPngFiles(absIn);

  if (pngPaths.length === 0) {
    console.warn('未找到 PNG 文件。');
    process.exit(0);
  }

  // 目录输入时只解析第一张图（排序后的第一张）
  const targets = pngPaths.slice(0, 1);
  console.log(`解析第一张 PNG: ${targets[0]}`);
  if (pngPaths.length > 1) {
    console.log(`（共 ${pngPaths.length} 张，其余已跳过）`);
  }

  console.log(`清空输出目录: ${absOut}`);
  await removeDirIfExists(absOut);

  const restoreMap = await buildRestoreMap(targets);

  if (restoreMap.size === 0) {
    console.warn(
      '未能从 PNG 读取源文件元数据。\n' +
        '请使用已更新、会在 PNG 中嵌入 SourcePayload 的 get.js 重新生成图片。',
    );
    process.exit(1);
  }

  const written = await writeRestoredFiles(restoreMap, absOut);
  console.log(`完成。共还原 ${written.length} 个文件，输出目录: ${absOut}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = {
  embedSourceInPng,
  embedAllSourcesInPng,
  writeMetadataToPng,
  stripSourcePayloadFromPng,
  extractSourceFromPng,
  extractAllSourcesFromPng,
  PAYLOAD_KEYWORD,
};
