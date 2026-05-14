---
mode: agent
description: 'Convert a PowerPoint (.pptx) file to a Marp markdown deck'
agent: marp-deck-generator
---

# Import from PPTX

Convert a PowerPoint presentation into a professional Marp slide deck.

## Input

{{{ input }}}

## Instructions

1. **Locate the file** — Confirm the `.pptx` file path with the user.
2. **Extract theme** — Run `node scripts/extract-pptx-theme.js <file.pptx>` to get color and font tokens.
3. **Convert slides** — Run `node scripts/convert-pptx-slides.js <file.pptx> <output-dir>` to convert all slides.
4. **Review output** — Open the generated `deck.md` and verify:
   - Slide structure matches the original order
   - Images were extracted to `images/`
   - Speaker notes were captured
   - No content overflow on any slide
5. **Apply template** — If the user wants a different look than the extracted theme, apply a built-in template instead.
6. **Refine** — Clean up any conversion artifacts (empty slides, placeholder text, chart comments).
7. **Render** — Run `bash scripts/render-deck.sh <deck.md> --html` and show the preview.

## Rules

- Follow the `pptx-to-marp` skill for layout and shape mapping
- Warn the user about charts, videos, and animations that cannot be converted
- If a slide exceeds content density limits, split it into multiple slides
- Preserve the original slide order
