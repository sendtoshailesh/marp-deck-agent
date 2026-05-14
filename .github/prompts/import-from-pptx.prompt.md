---
mode: agent
description: 'Import design themes, colors, and formatting from a PowerPoint (.pptx) file'
agent: marp-deck-generator
---

# Import from PPTX

Extract design themes, color palettes, typography, and formatting patterns from a PowerPoint presentation to use as design reference for Marp decks.

## Input

{{{ input }}}

## Instructions

1. **Locate the file** — Confirm the `.pptx` file path with the user.
2. **Extract theme tokens** — Run `node scripts/extract-pptx-theme.js <file.pptx>` to get color scheme, font families, and slide dimensions.
3. **Present the extracted design** — Show the user:
   - Color palette (dark/light, accents, hyperlink colors)
   - Font families (heading vs body)
   - Slide aspect ratio
4. **Generate a Marp theme** — Create a Marp CSS theme file that mirrors the extracted design tokens. Map PPT colors to Marp CSS variables using the `pptx-to-marp` skill's color resolution rules.
5. **Ask the user** — Should this theme be applied to a new deck, an existing deck, or saved as a reusable template?
6. **Register the theme** — Save the generated CSS to `templates/` and add to `.vscode/settings.json`.
7. **Preview** — Render a sample slide with the new theme and show the user.

## Rules

- This prompt is for **design extraction only** — not full slide-by-slide content conversion
- Follow the `pptx-to-marp` skill for color resolution (schemeClr → RGB) and font mapping
- If the PPT uses non-web-safe fonts, suggest the closest system font fallback
- Preserve the original PPT's dark/light mode feel based on color luminance
- The full conversion script (`convert-pptx-slides.js`) is available if the user later wants content conversion too
