---
mode: agent
description: 'Apply a template or restyle an existing Marp deck'
agent: marp-deck-generator
---

# Apply Template

Restyle an existing Marp deck by applying a different template theme.

## Input

{{{ input }}}

## Instructions

1. **Identify the deck** — Locate the existing `.md` deck file.
2. **Show templates** — Use the `marp-template-registry` skill to list available templates with descriptions. Ask the user to choose.
3. **Analyze current deck** — Read the deck and identify:
   - Current theme in frontmatter
   - Slide variant classes in use (`lead`, `gradient`, `light`, etc.)
   - Custom CSS in the `style:` block
4. **Map variants** — Convert slide variant classes from the old template to the new template's supported variants:
   - `executive-dark`: `lead`, `gradient`, `light`
   - `corporate-light`: `lead`, `accent`, `dark`
   - `tech-keynote`: `lead`, `code`, `light`
5. **Update frontmatter** — Change `theme:` to the new template name.
6. **Update classes** — Replace `<!-- _class: -->` directives with the new template's equivalent variants.
7. **Remove conflicting CSS** — Strip any custom `style:` block that conflicts with the new theme.
8. **Render and verify** — Run `bash scripts/render-deck.sh <deck.md> --html` and check for visual issues.
9. **Show comparison** — Describe the before/after differences to the user.

## Rules

- Do not change slide content — only change theme, classes, and custom CSS
- Preserve speaker notes
- If a slide variant has no direct mapping, use the default (no class) and note the change
