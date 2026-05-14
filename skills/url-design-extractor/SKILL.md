---
name: url-design-extractor
description: 'Extract design tokens (colors, fonts, spacing) from a live website URL and generate a Marp theme. USE FOR: importing design from website, extracting CSS tokens, creating theme from URL, matching web app branding.'
---

# URL Design Extractor

Extract design tokens from a live website and generate a matching Marp theme CSS file.

## Overview

Uses Playwright to load a URL in headless Chromium, then extracts computed CSS custom properties, typography, and color palette from the rendered page.

## Usage

```bash
node scripts/extract-url-tokens.js <url> [output-dir]
```

**Output:** Two files in the output directory (defaults to current directory):

1. `design-tokens.json` — Raw extracted tokens
2. `extracted-theme.css` — Ready-to-use Marp theme CSS

## What gets extracted

### CSS custom properties

All `--*` variables from `:root` and `body` computed styles:

```json
{
  "cssVariables": {
    "--color-primary": "#667eea",
    "--color-background": "#0f1419",
    "--font-sans": "Inter, system-ui, sans-serif"
  }
}
```

### Computed typography

From `body`, `h1`–`h6`, `p`, `a`, `button` elements:

```json
{
  "typography": {
    "body": { "fontFamily": "Inter", "fontSize": "16px", "lineHeight": "1.5", "color": "#e6edf3" },
    "h1": { "fontFamily": "Inter", "fontSize": "40px", "fontWeight": "800", "color": "#ffffff" },
    "h2": { "fontFamily": "Inter", "fontSize": "32px", "fontWeight": "700", "color": "#e6edf3" }
  }
}
```

### Color palette

Extracted from backgrounds, text, borders, buttons, and links:

```json
{
  "palette": {
    "background": ["#0d1117", "#161b22"],
    "text": ["#e6edf3", "#8b949e"],
    "accent": ["#58a6ff", "#3fb950"],
    "border": ["#30363d"]
  }
}
```

## Token-to-Marp theme mapping

The extraction script generates a Marp theme using these mapping rules:

| Extracted token | Marp CSS property | Fallback |
|---|---|---|
| Most frequent dark background | `section { background }` | `#0f1419` |
| Primary text color | `section { color }` | `#f5f7fb` |
| H1 font-family | `section h1 { font-family }` | `system-ui, sans-serif` |
| Body font-family | `section { font-family }` | `system-ui, sans-serif` |
| Primary accent | `section h3 { color }`, `.badge { border-color }` | `#667eea` |
| Secondary accent / warm tone | `strong { color }`, `.metric strong { color }` | `#ffd700` |
| Border color | `.panel { border-color }` | `rgba(255,255,255,0.14)` |
| Surface/card background | `.panel { background }` | `rgba(255,255,255,0.08)` |

### Dark vs light mode detection

The script determines mode by checking the background luminance of the `body` element:

- Luminance < 0.5 → **dark mode** theme generated
- Luminance >= 0.5 → **light mode** theme generated

## Generated theme structure

```css
/* @theme extracted-<domain> */

section {
  background: <bg-color>;
  color: <text-color>;
  font-family: '<body-font>', system-ui, sans-serif;
  font-size: 26px;
  padding: 48px 56px;
  line-height: 1.3;
}

section h1 {
  font-family: '<heading-font>', system-ui, sans-serif;
  font-size: 1.8em;
  font-weight: 800;
  color: <heading-color>;
}

/* ... additional styles mapped from tokens ... */
```

## Workflow

1. **Run extraction:** `node scripts/extract-url-tokens.js https://example.com ./output/`
2. **Review tokens:** Check `design-tokens.json` for accuracy
3. **Preview theme:** Copy `extracted-theme.css` to `templates/` and render a sample slide
4. **Adjust if needed:** The agent can tweak the generated theme based on user feedback
5. **Register theme:** Add to `.vscode/settings.json` for Marp preview

## Limitations

- **JavaScript-rendered content:** The script waits for the page to fully load, but SPAs with lazy-loaded themes may not expose all tokens immediately
- **CSS-in-JS:** Styled-components and Emotion tokens are visible only after JS execution (Playwright handles this)
- **Shadow DOM:** Custom elements with closed shadow roots cannot be inspected
- **Font files:** Only font-family names are extracted, not the actual font files. Use Google Fonts or system fonts as fallbacks.
- **Rate limiting:** Some sites may block headless browsers. If extraction fails, try with a different user-agent or ask the user for a CSS file directly.

## Fallback: manual CSS import

If the URL extraction fails or produces poor results, the user can provide a CSS file directly:

```bash
# The agent can read a CSS file and extract tokens manually
# Look for :root { --var-name: value } patterns
```

The agent should parse the CSS file for custom properties and generate a Marp theme from those.
