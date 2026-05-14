#!/usr/bin/env node

/**
 * convert-pptx-slides.js
 *
 * Convert a .pptx file into a Marp markdown deck with extracted images and theme.
 *
 * Usage: node scripts/convert-pptx-slides.js <input.pptx> <output-dir>
 */

import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

const OOXML_NS_PREFIXES = ['a:', 'p:', 'r:', 'mc:', 'dgm:', 'c:'];

function stripNs(key) {
  for (const ns of OOXML_NS_PREFIXES) {
    if (key.startsWith(ns)) return key.slice(ns.length);
  }
  return key;
}

function deepStripNs(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepStripNs);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[stripNs(k)] = deepStripNs(v);
  }
  return out;
}

function ensureArray(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/** Extract plain text from a text body node. */
function extractText(txBody) {
  if (!txBody) return [];
  const paragraphs = ensureArray(txBody.p);
  const lines = [];

  for (const para of paragraphs) {
    const runs = ensureArray(para.r);
    let text = '';
    for (const run of runs) {
      const t = run.t;
      if (typeof t === 'string') text += t;
      else if (t !== undefined && t !== null) text += String(t);
    }

    // Check for field codes (slide numbers, dates)
    const flds = ensureArray(para.fld);
    for (const fld of flds) {
      const t = fld.t;
      if (typeof t === 'string') text += t;
    }

    if (text.trim()) {
      const pPr = para.pPr;
      const level = pPr?.['@_lvl'] ? parseInt(pPr['@_lvl'], 10) : 0;
      const isBullet = pPr?.buNone === undefined && level >= 0 && paragraphs.length > 1;
      lines.push({ text: text.trim(), level, isBullet });
    }
  }

  return lines;
}

/** Determine if a shape is a title or body placeholder. */
function getPlaceholderType(sp) {
  const ph = sp?.nvSpPr?.nvPr?.ph;
  if (!ph) return null;
  return ph['@_type'] || 'body';
}

/** Extract relationship targets from a .rels file. */
function parseRels(zip, relsPath) {
  const entry = zip.getEntry(relsPath);
  if (!entry) return {};
  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
  const parsed = parser.parse(entry.getData().toString('utf8'));
  const rels = ensureArray(parsed?.Relationships?.Relationship);
  const map = {};
  for (const rel of rels) {
    if (rel?.['@_Id'] && rel?.['@_Target']) {
      map[rel['@_Id']] = rel['@_Target'];
    }
  }
  return map;
}

/** Extract images from ppt/media/ and save to output dir. */
function extractImages(zip, outputDir) {
  const imgDir = join(outputDir, 'images');
  mkdirSync(imgDir, { recursive: true });

  const extracted = {};
  for (const entry of zip.getEntries()) {
    if (entry.entryName.startsWith('ppt/media/')) {
      const filename = entry.entryName.split('/').pop();
      const outPath = join(imgDir, filename);
      writeFileSync(outPath, entry.getData());
      extracted[entry.entryName] = `./images/${filename}`;
    }
  }
  return extracted;
}

/** Extract speaker notes for a slide. */
function extractNotes(zip, slideIndex) {
  const notesPath = `ppt/notesSlides/notesSlide${slideIndex}.xml`;
  const entry = zip.getEntry(notesPath);
  if (!entry) return '';

  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: false });
  const parsed = deepStripNs(parser.parse(entry.getData().toString('utf8')));

  const shapes = ensureArray(parsed?.notes?.cSld?.spTree?.sp);
  const noteLines = [];

  for (const sp of shapes) {
    const phType = getPlaceholderType(sp);
    if (phType === 'body') {
      const lines = extractText(sp?.txBody);
      for (const line of lines) {
        if (line.text && !line.text.match(/^\d+$/)) {
          noteLines.push(line.text);
        }
      }
    }
  }

  return noteLines.join('\n');
}

/** Convert a single slide XML to Marp markdown. */
function convertSlide(slideObj, rels, imageMap) {
  const spTree = slideObj?.sld?.cSld?.spTree || slideObj?.cSld?.spTree;
  if (!spTree) return { title: '', body: '', images: [] };

  const shapes = ensureArray(spTree.sp);
  const pics = ensureArray(spTree.pic);

  let title = '';
  let subtitle = '';
  const bodyLines = [];
  const slideImages = [];

  // Process text shapes
  for (const sp of shapes) {
    const phType = getPlaceholderType(sp);
    const lines = extractText(sp?.txBody);

    if (phType === 'title' || phType === 'ctrTitle') {
      title = lines.map(l => l.text).join(' ');
    } else if (phType === 'subTitle') {
      subtitle = lines.map(l => l.text).join(' ');
    } else if (lines.length > 0) {
      for (const line of lines) {
        const indent = '  '.repeat(line.level);
        const prefix = line.isBullet ? '- ' : '';
        bodyLines.push(`${indent}${prefix}${line.text}`);
      }
    }
  }

  // Process picture shapes
  for (const pic of pics) {
    const blipFill = pic?.blipFill;
    const rId = blipFill?.blip?.['@_embed'];
    if (rId && rels[rId]) {
      const target = rels[rId];
      const mediaPath = target.startsWith('../') ? `ppt/${target.slice(3)}` : `ppt/slides/${target}`;
      const mappedPath = imageMap[mediaPath];
      if (mappedPath) {
        slideImages.push(mappedPath);
      }
    }
  }

  return { title, subtitle, body: bodyLines.join('\n'), images: slideImages };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node convert-pptx-slides.js <input.pptx> <output-dir>');
    process.exit(1);
  }

  const inputPath = resolve(args[0]);
  const outputDir = resolve(args[1]);
  mkdirSync(outputDir, { recursive: true });

  let zip;
  try {
    zip = new AdmZip(inputPath);
  } catch (err) {
    console.error(`Failed to open ${inputPath}: ${err.message}`);
    process.exit(1);
  }

  // Extract theme tokens first
  const tokensPath = join(outputDir, 'tokens.json');
  try {
    execFileSync('node', [resolve('scripts/extract-pptx-theme.js'), inputPath, tokensPath], {
      stdio: 'inherit',
    });
  } catch {
    console.warn('Warning: Could not extract theme tokens. Continuing with defaults.');
  }

  // Extract images
  const imageMap = extractImages(zip, outputDir);
  console.log(`Extracted ${Object.keys(imageMap).length} images`);

  // Find slide entries and sort by number
  const slideEntries = zip.getEntries()
    .filter(e => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.entryName.match(/slide(\d+)/)?.[1] || '0', 10);
      return numA - numB;
    });

  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: false });
  const slides = [];

  for (const entry of slideEntries) {
    const slideNum = parseInt(entry.entryName.match(/slide(\d+)/)?.[1] || '0', 10);
    const raw = parser.parse(entry.getData().toString('utf8'));
    const slideObj = deepStripNs(raw);

    // Parse relationships for this slide
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const rels = parseRels(zip, relsPath);

    const { title, subtitle, body, images } = convertSlide(slideObj, rels, imageMap);
    const notes = extractNotes(zip, slideNum);

    slides.push({ slideNum, title, subtitle, body, images, notes });
  }

  // Generate Marp markdown
  const marpLines = [
    '---',
    'marp: true',
    'theme: executive-dark',
    'size: 16:9',
    'paginate: true',
    '---',
    '',
  ];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];

    // First slide: use lead class
    if (i === 0) {
      marpLines.push('<!-- _class: lead -->');
      marpLines.push('');
    }

    // Background images
    for (const img of s.images) {
      if (i === 0) {
        marpLines.push(`![bg right:40% opacity:0.3](${img})`);
      } else {
        marpLines.push(`![bg right:35%](${img})`);
      }
    }

    // Title
    if (s.title) {
      marpLines.push(`# ${s.title}`);
      marpLines.push('');
    }

    // Subtitle
    if (s.subtitle) {
      marpLines.push(`## ${s.subtitle}`);
      marpLines.push('');
    }

    // Body content
    if (s.body) {
      marpLines.push(s.body);
      marpLines.push('');
    }

    // Speaker notes
    if (s.notes) {
      marpLines.push('<!--');
      marpLines.push(s.notes);
      marpLines.push('-->');
      marpLines.push('');
    }

    // Slide separator (except for last slide)
    if (i < slides.length - 1) {
      marpLines.push('---');
      marpLines.push('');
    }
  }

  const deckPath = join(outputDir, 'deck.md');
  writeFileSync(deckPath, marpLines.join('\n'));
  console.log(`\nConverted ${slides.length} slides to ${deckPath}`);

  // Generate theme CSS from tokens if available
  if (existsSync(tokensPath)) {
    try {
      const { readFileSync } = await import('node:fs');
      const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
      generateThemeCss(tokens, join(outputDir, 'theme.css'));
    } catch {
      console.warn('Warning: Could not generate theme CSS from tokens.');
    }
  }
}

function generateThemeCss(tokens, outputPath) {
  const c = tokens.colors || {};
  const f = tokens.fonts || {};

  const bg = c.dark1 || '#0f1419';
  const fg = c.light1 || '#f5f7fb';
  const accent = c.accent1 || '#667eea';
  const accent2 = c.accent4 || c.accent2 || '#ffd700';
  const heading = f.major || 'system-ui';
  const body = f.minor || 'system-ui';

  const css = `/* @theme pptx-imported */

section {
  background: ${bg};
  color: ${fg};
  font-family: '${body}', system-ui, sans-serif;
  font-size: 26px;
  padding: 48px 56px;
  line-height: 1.3;
}

section h1 {
  font-family: '${heading}', system-ui, sans-serif;
  font-size: 1.8em;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.2em;
}

section h2 {
  font-size: 1.02em;
  color: ${fg}cc;
  margin-bottom: 0.5em;
}

section h3 {
  color: ${accent2};
  font-size: 0.95em;
}

strong {
  color: #ffffff;
}

blockquote {
  border-left: 6px solid ${accent2};
  background: rgba(255, 255, 255, 0.08);
  padding: 0.5em 0.8em;
  border-radius: 12px;
}

table {
  width: 100%;
  font-size: 0.72em;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
}

th {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  text-align: left;
  padding: 12px 14px;
}

td {
  padding: 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

section.lead {
  background: linear-gradient(135deg, ${accent} 0%, ${bg} 100%);
  color: #ffffff;
  justify-content: center;
}

section.lead h1, section.lead h2, section.lead h3 {
  color: #ffffff;
}
`;

  writeFileSync(outputPath, css);
  console.log(`Theme CSS written to ${outputPath}`);
}

main();
