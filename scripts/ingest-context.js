#!/usr/bin/env node

/**
 * ingest-context.js
 *
 * Normalize a context file (md, txt, pdf, docx, pptx) into a structured
 * outline JSON the deck planner can consume.
 *
 * Output schema:
 * {
 *   "source": "/abs/path/input.pdf",
 *   "format": "pdf",
 *   "title": "inferred title or filename",
 *   "sections": [
 *     {
 *       "heading": "Section heading or null",
 *       "level": 1,
 *       "paragraphs": ["..."],
 *       "bullets": ["..."],
 *       "tables": [{"headers": [...], "rows": [[...]]}],
 *       "images": ["/abs/path/extracted/img1.png"]
 *     }
 *   ],
 *   "raw_text": "...",
 *   "word_count": 1234,
 *   "image_dir": "/abs/path/extracted/images"
 * }
 *
 * Usage:
 *   node scripts/ingest-context.js <input> <output-json> [--images-dir <dir>]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, extname, basename, join } from 'node:path';

function usage() {
  console.error('Usage: node scripts/ingest-context.js <input> <output-json> [--images-dir <dir>]');
  process.exit(1);
}

function parseArgs(argv) {
  if (argv.length < 2) usage();
  const opts = { input: resolve(argv[0]), output: resolve(argv[1]), imagesDir: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--images-dir') opts.imagesDir = resolve(argv[++i]);
  }
  if (!opts.imagesDir) {
    opts.imagesDir = join(resolve(opts.output, '..'), 'context-images');
  }
  return opts;
}

function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

// ---------- Markdown / plain text ----------

function ingestMarkdown(text, source) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = { heading: null, level: 0, paragraphs: [], bullets: [], tables: [], images: [] };
  let title = null;
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      current.paragraphs.push(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
    }
  };

  const flushSection = () => {
    flushParagraph();
    if (current.heading || current.paragraphs.length || current.bullets.length) {
      sections.push(current);
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (headingMatch) {
      flushSection();
      const level = headingMatch[1].length;
      const heading = headingMatch[2].trim();
      if (!title && level === 1) title = heading;
      current = { heading, level, paragraphs: [], bullets: [], tables: [], images: [] };
    } else if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      current.bullets.push(line.replace(/^\s*[-*+]\s+/, '').trim());
    } else if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph();
      current.bullets.push(line.replace(/^\s*\d+\.\s+/, '').trim());
    } else if (/^\s*\|.+\|\s*$/.test(line)) {
      // Markdown table
      const tableLines = [];
      while (i < lines.length && /^\s*\|.+\|\s*$/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      i--;
      const parsed = parseMdTable(tableLines);
      if (parsed) current.tables.push(parsed);
    } else if (/^\s*!\[.*?\]\((.+?)\)/.test(line)) {
      const m = /!\[.*?\]\((.+?)\)/.exec(line);
      if (m) current.images.push(m[1]);
    } else if (line.trim() === '') {
      flushParagraph();
    } else {
      paragraphBuffer.push(line.trim());
    }
    i++;
  }
  flushSection();

  return {
    source,
    format: 'markdown',
    title: title || basename(source),
    sections,
    raw_text: text,
    word_count: wordCount(text),
  };
}

function parseMdTable(lines) {
  if (lines.length < 2) return null;
  const split = (l) =>
    l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const headers = split(lines[0]);
  const rows = [];
  for (let i = 2; i < lines.length; i++) rows.push(split(lines[i]));
  return { headers, rows };
}

function ingestText(text, source) {
  // Treat as one section, paragraphs split by blank lines.
  const paragraphs = text.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
  return {
    source,
    format: 'text',
    title: basename(source),
    sections: [{ heading: null, level: 0, paragraphs, bullets: [], tables: [], images: [] }],
    raw_text: text,
    word_count: wordCount(text),
  };
}

// ---------- PDF ----------

async function ingestPdf(inputPath, source) {
  let pdfParse;
  try {
    ({ default: pdfParse } = await import('pdf-parse'));
  } catch {
    throw new Error('pdf-parse not installed. Run: npm install pdf-parse');
  }
  const buf = readFileSync(inputPath);
  const data = await pdfParse(buf);
  const text = data.text || '';
  // Heuristic sectioning: blank-line-separated blocks, treat ALL-CAPS or short lines as headings.
  const blocks = text.split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean);
  const sections = [];
  let current = { heading: null, level: 0, paragraphs: [], bullets: [], tables: [], images: [] };

  for (const block of blocks) {
    const looksLikeHeading =
      block.length < 80 && /^[A-Z0-9][^.]*$/.test(block.split('\n')[0]) && !block.includes('. ');
    if (looksLikeHeading) {
      if (current.paragraphs.length || current.bullets.length) sections.push(current);
      current = {
        heading: block.split('\n')[0].trim(),
        level: 1,
        paragraphs: [],
        bullets: [],
        tables: [],
        images: [],
      };
    } else {
      // Detect bullets
      const lines = block.split(/\r?\n/);
      const isBulletBlock = lines.every((l) => /^\s*([-*•·]|\d+[.)])\s+/.test(l));
      if (isBulletBlock) {
        for (const l of lines) {
          current.bullets.push(l.replace(/^\s*([-*•·]|\d+[.)])\s+/, '').trim());
        }
      } else {
        current.paragraphs.push(block.replace(/\s+/g, ' ').trim());
      }
    }
  }
  if (current.paragraphs.length || current.bullets.length) sections.push(current);

  return {
    source,
    format: 'pdf',
    title: data.info?.Title || basename(source),
    sections,
    raw_text: text,
    word_count: wordCount(text),
    pdf_meta: { pages: data.numpages, info: data.info || {} },
  };
}

// ---------- DOCX ----------

async function ingestDocx(inputPath, source, imagesDir) {
  let mammoth;
  try {
    const mod = await import('mammoth');
    mammoth = mod.default ?? mod;
  } catch {
    throw new Error('mammoth not installed. Run: npm install mammoth');
  }

  mkdirSync(imagesDir, { recursive: true });
  let imgCounter = 0;
  const savedImages = [];

  const result = await mammoth.convertToHtml(
    { path: inputPath },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const ext = (image.contentType || 'image/png').split('/')[1] || 'png';
        const filename = `docx-img-${++imgCounter}.${ext}`;
        const outPath = join(imagesDir, filename);
        const buffer = await image.read();
        writeFileSync(outPath, buffer);
        savedImages.push(outPath);
        return { src: outPath };
      }),
    }
  );

  const html = result.value || '';
  // Lightweight HTML → structured outline
  const sections = htmlToSections(html);
  // Attach orphan images (not yet captured) to a trailing section
  const imageSet = new Set(sections.flatMap((s) => s.images));
  const orphanImages = savedImages.filter((p) => !imageSet.has(p));
  if (orphanImages.length) {
    sections.push({
      heading: 'Images',
      level: 2,
      paragraphs: [],
      bullets: [],
      tables: [],
      images: orphanImages,
    });
  }

  const rawText = (await mammoth.extractRawText({ path: inputPath })).value || '';
  const titleFromH1 = sections.find((s) => s.level === 1)?.heading;

  return {
    source,
    format: 'docx',
    title: titleFromH1 || basename(source),
    sections,
    raw_text: rawText,
    word_count: wordCount(rawText),
    image_dir: imagesDir,
  };
}

function htmlToSections(html) {
  const sections = [];
  let current = { heading: null, level: 0, paragraphs: [], bullets: [], tables: [], images: [] };

  const tagRe =
    /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>|<p[^>]*>([\s\S]*?)<\/p>|<(ul|ol)[^>]*>([\s\S]*?)<\/\4>|<table[^>]*>([\s\S]*?)<\/table>|<img[^>]*src="([^"]+)"[^>]*\/?>/gi;
  const stripTags = (s) =>
    s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[1]) {
      // heading
      const level = parseInt(m[1].slice(1), 10);
      if (current.heading || current.paragraphs.length || current.bullets.length) {
        sections.push(current);
      }
      current = {
        heading: stripTags(m[2]),
        level,
        paragraphs: [],
        bullets: [],
        tables: [],
        images: [],
      };
    } else if (m[3] !== undefined) {
      const text = stripTags(m[3]);
      if (text) current.paragraphs.push(text);
    } else if (m[4]) {
      const items = [...m[5].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((x) => stripTags(x[1]));
      current.bullets.push(...items.filter(Boolean));
    } else if (m[6]) {
      const table = parseHtmlTable(m[6]);
      if (table) current.tables.push(table);
    } else if (m[7]) {
      current.images.push(m[7]);
    }
  }
  if (current.heading || current.paragraphs.length || current.bullets.length) sections.push(current);
  return sections;
}

function parseHtmlTable(inner) {
  const rows = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) => r[1]);
  if (!rows.length) return null;
  const parseRow = (r) =>
    [...r.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) =>
      c[1].replace(/<[^>]+>/g, '').trim()
    );
  const headers = parseRow(rows[0]);
  const body = rows.slice(1).map(parseRow);
  return { headers, rows: body };
}

// ---------- PPTX (as context, not template) ----------

async function ingestPptx(inputPath, source, imagesDir) {
  const { default: AdmZip } = await import('adm-zip');
  const { XMLParser } = await import('fast-xml-parser');
  mkdirSync(imagesDir, { recursive: true });

  const zip = new AdmZip(inputPath);
  // Save media
  const imageMap = {};
  for (const entry of zip.getEntries()) {
    if (entry.entryName.startsWith('ppt/media/')) {
      const filename = entry.entryName.split('/').pop();
      const out = join(imagesDir, filename);
      writeFileSync(out, entry.getData());
      imageMap[entry.entryName] = out;
    }
  }

  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
  const slideEntries = zip
    .getEntries()
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => {
      const na = parseInt(a.entryName.match(/slide(\d+)/)?.[1] || '0', 10);
      const nb = parseInt(b.entryName.match(/slide(\d+)/)?.[1] || '0', 10);
      return na - nb;
    });

  const sections = [];
  let rawText = '';

  for (const entry of slideEntries) {
    const parsed = parser.parse(entry.getData().toString('utf8'));
    const allText = collectAllText(parsed);
    if (!allText.length) continue;
    const heading = allText[0];
    const rest = allText.slice(1);
    sections.push({
      heading,
      level: 1,
      paragraphs: rest.filter((t) => t.length > 80),
      bullets: rest.filter((t) => t.length <= 80),
      tables: [],
      images: [],
    });
    rawText += allText.join('\n') + '\n\n';
  }

  return {
    source,
    format: 'pptx',
    title: sections[0]?.heading || basename(source),
    sections,
    raw_text: rawText,
    word_count: wordCount(rawText),
    image_dir: imagesDir,
  };
}

function collectAllText(node, out = []) {
  if (node === null || node === undefined) return out;
  if (typeof node === 'string') {
    const t = node.trim();
    if (t) out.push(t);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectAllText(item, out);
    return out;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 't' && typeof v === 'string') {
        const t = v.trim();
        if (t) out.push(t);
      } else {
        collectAllText(v, out);
      }
    }
  }
  return out;
}

// ---------- Main ----------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!existsSync(opts.input)) {
    console.error(`Not found: ${opts.input}`);
    process.exit(1);
  }

  const ext = extname(opts.input).toLowerCase();
  let result;

  if (ext === '.md' || ext === '.markdown') {
    result = ingestMarkdown(readFileSync(opts.input, 'utf8'), opts.input);
  } else if (ext === '.txt') {
    result = ingestText(readFileSync(opts.input, 'utf8'), opts.input);
  } else if (ext === '.pdf') {
    result = await ingestPdf(opts.input, opts.input);
  } else if (ext === '.docx') {
    result = await ingestDocx(opts.input, opts.input, opts.imagesDir);
  } else if (ext === '.pptx') {
    result = await ingestPptx(opts.input, opts.input, opts.imagesDir);
  } else {
    console.error(`Unsupported extension: ${ext}. Supported: .md, .txt, .pdf, .docx, .pptx`);
    process.exit(1);
  }

  writeFileSync(opts.output, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Wrote outline: ${opts.output}`);
  console.log(`  Format: ${result.format}`);
  console.log(`  Sections: ${result.sections.length}`);
  console.log(`  Words: ${result.word_count}`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
