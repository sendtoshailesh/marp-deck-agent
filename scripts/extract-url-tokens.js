#!/usr/bin/env node

/**
 * extract-url-tokens.js
 *
 * Extract design tokens (CSS variables, colors, typography) from a live website URL
 * using Playwright and generate a Marp theme CSS file.
 *
 * Usage: node scripts/extract-url-tokens.js <url> [output-dir]
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

/** Calculate relative luminance of a hex color. */
function luminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb || rgb.length < 3) return 0.5;
  const [r, g, b] = rgb.map(c => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function extractTokens(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    // Fall back to domcontentloaded if networkidle times out
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
  }

  const tokens = await page.evaluate(() => {
    const root = document.documentElement;
    const rootStyles = getComputedStyle(root);
    const bodyStyles = getComputedStyle(document.body);

    // Extract CSS custom properties from :root
    const cssVariables = {};
    for (const prop of rootStyles) {
      if (prop.startsWith('--')) {
        cssVariables[prop] = rootStyles.getPropertyValue(prop).trim();
      }
    }

    // Extract typography from key elements
    const typography = {};
    const selectors = { body: 'body', h1: 'h1', h2: 'h2', h3: 'h3', p: 'p', a: 'a', button: 'button' };
    for (const [name, sel] of Object.entries(selectors)) {
      const el = document.querySelector(sel);
      if (el) {
        const s = getComputedStyle(el);
        typography[name] = {
          fontFamily: s.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          color: s.color,
          letterSpacing: s.letterSpacing,
        };
      }
    }

    // Extract color palette from various elements
    const colorSet = new Set();
    const bgColors = new Set();
    const textColors = new Set();
    const accentColors = new Set();

    // Body and main containers
    bgColors.add(bodyStyles.backgroundColor);
    textColors.add(bodyStyles.color);

    // Sample key elements for accent colors
    const accentSelectors = ['a', 'button', '[class*="primary"]', '[class*="accent"]', '[class*="brand"]'];
    for (const sel of accentSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const s = getComputedStyle(el);
        accentColors.add(s.color);
        if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          accentColors.add(s.backgroundColor);
        }
      }
    }

    // Sample headers and sections for background diversity
    for (const sel of ['header', 'nav', 'main', 'section', 'footer', '.hero', '[class*="header"]']) {
      const el = document.querySelector(sel);
      if (el) {
        const s = getComputedStyle(el);
        if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          bgColors.add(s.backgroundColor);
        }
      }
    }

    // Border colors
    const borderColors = new Set();
    for (const sel of ['div', 'section', 'article', 'aside']) {
      const el = document.querySelector(sel);
      if (el) {
        const s = getComputedStyle(el);
        if (s.borderColor && s.borderColor !== 'rgb(0, 0, 0)') {
          borderColors.add(s.borderColor);
        }
      }
    }

    return {
      cssVariables,
      typography,
      palette: {
        background: [...bgColors],
        text: [...textColors],
        accent: [...accentColors],
        border: [...borderColors],
      },
    };
  });

  await browser.close();
  return tokens;
}

function rgbToHex(rgb) {
  if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb.startsWith('#') ? rgb : null;
  const [, r, g, b] = match;
  return `#${[r, g, b].map(c => parseInt(c, 10).toString(16).padStart(2, '0')).join('')}`;
}

function generateTheme(tokens, domain) {
  const bg = tokens.palette.background.map(rgbToHex).filter(Boolean);
  const text = tokens.palette.text.map(rgbToHex).filter(Boolean);
  const accent = tokens.palette.accent.map(rgbToHex).filter(Boolean);
  const border = tokens.palette.border.map(rgbToHex).filter(Boolean);

  const primaryBg = bg[0] || '#0f1419';
  const primaryText = text[0] || '#f5f7fb';
  const primaryAccent = accent[0] || '#667eea';
  const secondaryAccent = accent[1] || '#ffd700';
  const borderColor = border[0] || 'rgba(255,255,255,0.14)';

  const isDark = luminance(primaryBg) < 0.5;

  const typo = tokens.typography || {};
  const headingFont = typo.h1?.fontFamily || 'system-ui';
  const bodyFont = typo.body?.fontFamily || typo.p?.fontFamily || 'system-ui';

  const themeName = `extracted-${domain.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

  return `/* @theme ${themeName} */

/* Auto-generated from ${domain} */
/* Mode: ${isDark ? 'dark' : 'light'} */

section {
  background: ${primaryBg};
  color: ${primaryText};
  font-family: '${bodyFont}', system-ui, sans-serif;
  font-size: 26px;
  padding: 48px 56px;
  line-height: 1.3;
}

section h1 {
  font-family: '${headingFont}', system-ui, sans-serif;
  font-size: 1.8em;
  font-weight: 800;
  color: ${isDark ? '#ffffff' : '#1a1a1a'};
  margin-bottom: 0.2em;
}

section h2 {
  font-size: 1.02em;
  color: ${primaryText}cc;
  margin-bottom: 0.5em;
}

section h3 {
  color: ${primaryAccent};
  font-size: 0.95em;
  margin: 0.2em 0 0.4em;
}

strong {
  color: ${isDark ? '#ffffff' : '#1a1a1a'};
}

blockquote {
  border-left: 6px solid ${secondaryAccent};
  background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
  padding: 0.5em 0.8em;
  border-radius: 12px;
}

table {
  width: 100%;
  font-size: 0.72em;
  border-collapse: collapse;
  background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)'};
  border: 1px solid ${borderColor};
  border-radius: 14px;
}

th {
  background: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'};
  color: ${isDark ? '#ffffff' : '#1a1a1a'};
  text-align: left;
  padding: 12px 14px;
}

td {
  padding: 12px 14px;
  border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
}

.panel {
  background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)'};
  border: 1px solid ${borderColor};
  border-radius: 18px;
  padding: 20px 22px;
}

.metric {
  background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)'};
  border: 1px solid ${borderColor};
  border-radius: 18px;
  padding: 18px 20px;
  margin-top: 0.5em;
}

.metric strong {
  display: block;
  font-size: 1.6em;
  color: ${secondaryAccent};
}

.badge-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 0.65em; }
.badge {
  background: ${primaryAccent}1f;
  color: ${primaryAccent};
  border: 1px solid ${primaryAccent}47;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.64em;
  font-weight: 700;
}

section.lead {
  background: linear-gradient(135deg, ${primaryAccent} 0%, ${secondaryAccent || primaryBg} 100%);
  color: #ffffff;
  justify-content: center;
}

section.lead h1, section.lead h2, section.lead h3 {
  color: #ffffff;
}
`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node extract-url-tokens.js <url> [output-dir]');
    process.exit(1);
  }

  const url = args[0];
  const outputDir = resolve(args[1] || '.');
  mkdirSync(outputDir, { recursive: true });

  console.log(`Extracting design tokens from ${url}...`);

  const tokens = await extractTokens(url);

  // Write raw tokens
  const tokensPath = join(outputDir, 'design-tokens.json');
  writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  console.log(`Design tokens written to ${tokensPath}`);
  console.log(`  CSS variables: ${Object.keys(tokens.cssVariables).length}`);
  console.log(`  Typography entries: ${Object.keys(tokens.typography).length}`);

  // Generate theme CSS
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = 'custom';
  }

  const themeCss = generateTheme(tokens, domain);
  const themePath = join(outputDir, 'extracted-theme.css');
  writeFileSync(themePath, themeCss);
  console.log(`Marp theme written to ${themePath}`);
}

main();
