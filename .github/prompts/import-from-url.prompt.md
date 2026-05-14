---
mode: agent
description: 'Extract design tokens from a website URL and create a matching Marp theme'
agent: marp-deck-generator
---

# Import from URL

Extract design tokens from a live website and generate a Marp deck theme that matches the site's visual identity.

## Input

{{{ input }}}

## Instructions

1. **Get the URL** — Confirm the target URL with the user. Ask if they want to match a specific page or the homepage.
2. **Extract tokens** — Run `node scripts/extract-url-tokens.js <url> <output-dir>` to extract CSS variables, colors, typography, and palette.
3. **Review tokens** — Show the user the extracted palette summary:
   - Background colors
   - Text colors
   - Accent colors
   - Font families
   - Dark vs light mode detection
4. **Generate theme** — The script auto-generates `extracted-theme.css`. Register it in `.vscode/settings.json`.
5. **Create deck** — If the user wants a new deck with this theme, follow the `generate-deck` workflow using the extracted theme.
6. **Render preview** — Render a sample slide with the extracted theme and show the user.

## Rules

- Follow the `url-design-extractor` skill for token mapping and fallbacks
- If extraction fails (site blocks headless browsers), offer the manual CSS import fallback
- Never hardcode credentials or API keys in extraction scripts
- Ask the user before navigating to any URL
