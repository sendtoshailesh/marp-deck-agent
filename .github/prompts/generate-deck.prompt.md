---
mode: agent
description: 'Generate a professional Marp slide deck from a topic or brief'
agent: marp-deck-generator
---

# Generate Deck

Create a professional Marp slide deck from a topic, brief, or outline.

## Input

{{{ input }}}

## Instructions

1. **Clarify scope** — Ask the user about audience, tone, slide count, and template preference if not specified.
2. **Choose template** — Use the `marp-template-registry` skill to select the best-fit template. Default to `executive-dark` for business, `tech-keynote` for technical.
3. **Generate outline** — Create a slide-by-slide outline with titles, key points per slide, and slide type (hero, content, stat, flow, etc.). Present to the user for approval.
4. **Write deck** — Generate the full Marp markdown following `marp-deck-design` skill rules. Respect content density limits. Use the selected template's CSS classes.
5. **Render and verify** — Run `bash scripts/render-deck.sh <deck.md> --html` and check the output for overflow or formatting issues.
6. **Iterate** — Show the user the rendered preview and refine based on feedback.

## Rules

- Follow all constraints in the `marp-authoring` instructions
- Never use inline SVG — use Unicode emoji for icons
- Never exceed content density limits per slide type
- Include speaker notes for every content slide
- Save the deck file to disk before rendering
