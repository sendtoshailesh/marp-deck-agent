#!/usr/bin/env node

/**
 * extract-pptx-theme.js
 *
 * Extract design tokens (colors, fonts, slide size) from a PowerPoint .pptx file.
 * A .pptx is a ZIP archive; theme data lives in ppt/theme/theme1.xml.
 *
 * Usage: node scripts/extract-pptx-theme.js <input.pptx> [output.json]
 */

import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OOXML_NS_PREFIXES = ['a:', 'p:', 'r:'];

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

function extractColorScheme(themeObj) {
  const colors = {};
  const fmtScheme = themeObj?.theme?.themeElements?.clrScheme;
  if (!fmtScheme) return colors;

  const colorSlots = [
    'dk1', 'lt1', 'dk2', 'lt2',
    'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6',
    'hlink', 'folHlink',
  ];

  const friendlyNames = {
    dk1: 'dark1', lt1: 'light1', dk2: 'dark2', lt2: 'light2',
    hlink: 'hyperlink', folHlink: 'followedHyperlink',
  };

  for (const slot of colorSlots) {
    const entry = fmtScheme[slot];
    if (!entry) continue;

    let hex = null;
    if (entry.srgbClr) {
      hex = entry.srgbClr['@_val'] || entry.srgbClr;
    } else if (entry.sysClr) {
      hex = entry.sysClr['@_lastClr'] || entry.sysClr['@_val'] || null;
    }

    if (hex && typeof hex === 'string') {
      const name = friendlyNames[slot] || slot;
      colors[name] = `#${hex}`;
    }
  }

  return colors;
}

function extractFonts(themeObj) {
  const fontScheme = themeObj?.theme?.themeElements?.fontScheme;
  if (!fontScheme) return { major: 'system-ui', minor: 'system-ui' };

  const major = fontScheme.majorFont?.latin?.['@_typeface'] || 'system-ui';
  const minor = fontScheme.minorFont?.latin?.['@_typeface'] || 'system-ui';

  return { major, minor };
}

function extractSlideSize(zip) {
  const presEntry = zip.getEntry('ppt/presentation.xml');
  if (!presEntry) return { width: 12192000, height: 6858000, aspect: '16:9' };

  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: false });
  const presXml = parser.parse(presEntry.getData().toString('utf8'));
  const stripped = deepStripNs(presXml);

  const sldSz = stripped?.Presentation?.sldSz || stripped?.presentation?.sldSz;
  if (!sldSz) return { width: 12192000, height: 6858000, aspect: '16:9' };

  const width = parseInt(sldSz['@_cx'] || '12192000', 10);
  const height = parseInt(sldSz['@_cy'] || '6858000', 10);
  const ratio = width / height;
  const aspect = Math.abs(ratio - 16 / 9) < 0.1 ? '16:9' : '4:3';

  return { width, height, aspect };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node extract-pptx-theme.js <input.pptx> [output.json]');
    process.exit(1);
  }

  const inputPath = resolve(args[0]);
  const outputPath = resolve(args[1] || 'tokens.json');

  let zip;
  try {
    zip = new AdmZip(inputPath);
  } catch (err) {
    console.error(`Failed to open ${inputPath}: ${err.message}`);
    process.exit(1);
  }

  // Parse theme XML
  const themeEntry = zip.getEntry('ppt/theme/theme1.xml');
  if (!themeEntry) {
    console.error('No theme found at ppt/theme/theme1.xml');
    process.exit(1);
  }

  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: false });
  const rawTheme = parser.parse(themeEntry.getData().toString('utf8'));
  const themeObj = deepStripNs(rawTheme);

  const tokens = {
    colors: extractColorScheme(themeObj),
    fonts: extractFonts(themeObj),
    slideSize: extractSlideSize(zip),
  };

  writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
  console.log(`Theme tokens written to ${outputPath}`);
  console.log(`  Colors: ${Object.keys(tokens.colors).length} entries`);
  console.log(`  Fonts: major="${tokens.fonts.major}", minor="${tokens.fonts.minor}"`);
  console.log(`  Slide size: ${tokens.slideSize.aspect}`);
}

main();
