---
name: marp-template-registry
description: 'Catalog of built-in Marp deck templates with metadata, previews, and extensibility guidance. USE FOR: choosing a template, listing templates, adding new templates, applying a template to a deck.'
---

# Marp Template Registry

Catalog of built-in professional templates and instructions for extending the collection.

## Built-in templates

### 1. executive-dark

**Best for:** Executive briefings, board presentations, leadership updates

| Property | Value |
|---|---|
| Mode | Dark |
| Primary background | `#0f1419` with gradient overlay |
| Accent colors | Gold (`#ffd700`), blue-purple (`#667eea`) |
| Typography | System UI, weight 800 headings |
| Decorative | Glass morphism panels, ambient glow pseudo-elements |
| Slide variants | `lead` (hero gradient), `gradient` (accent gradient), `light` (white mode) |

**Files:**
- `templates/executive-dark/theme.css`
- `templates/executive-dark/preview.md`
- `templates/executive-dark/metadata.json`

### 2. corporate-light

**Best for:** Corporate reports, team updates, client-facing presentations

| Property | Value |
|---|---|
| Mode | Light |
| Primary background | `#f7f9fc` to `#eef3fb` gradient |
| Accent colors | Blue (`#2563eb`), slate (`#334155`) |
| Typography | System UI, clean weight 700 headings |
| Decorative | Subtle shadows, thin borders, clean card layouts |
| Slide variants | `lead` (blue hero), `accent` (blue gradient), `dark` (inverted) |

**Files:**
- `templates/corporate-light/theme.css`
- `templates/corporate-light/preview.md`
- `templates/corporate-light/metadata.json`

### 3. tech-keynote

**Best for:** Product launches, developer conferences, technical showcases

| Property | Value |
|---|---|
| Mode | Dark |
| Primary background | `#09090b` (near-black) |
| Accent colors | Green (`#22c55e`), cyan (`#06b6d4`) |
| Typography | Mono headings, system UI body |
| Decorative | Terminal-style code blocks, grid lines, neon glow |
| Slide variants | `lead` (neon gradient), `code` (terminal background), `light` (white mode) |

**Files:**
- `templates/tech-keynote/theme.css`
- `templates/tech-keynote/preview.md`
- `templates/tech-keynote/metadata.json`

## Template selection guidance

When the user does not specify a style, ask:

1. **What's the audience?**
   - Executives / leadership → `executive-dark`
   - Corporate / clients → `corporate-light`
   - Developers / engineers → `tech-keynote`

2. **What's the tone?**
   - Premium / authoritative → `executive-dark`
   - Clean / professional → `corporate-light`
   - Bold / technical → `tech-keynote`

3. **Light or dark preference?**
   - Dark → `executive-dark` or `tech-keynote`
   - Light → `corporate-light`

## Applying a template to an existing deck

1. Change `theme:` in the deck frontmatter to the template name
2. Ensure the template CSS file is in `templates/<name>/theme.css`
3. Register in `.vscode/settings.json` if not already listed
4. Review slide classes — each template supports different variant names:
   - `executive-dark`: `lead`, `gradient`, `light`
   - `corporate-light`: `lead`, `accent`, `dark`
   - `tech-keynote`: `lead`, `code`, `light`
5. Adjust any custom CSS in the frontmatter `style:` block to use the new template's CSS variables

## Template metadata schema

Each template directory contains a `metadata.json`:

```json
{
  "name": "executive-dark",
  "displayName": "Executive Dark",
  "description": "Premium dark theme with gold accents and glass morphism panels",
  "version": "1.0.0",
  "author": "marp-deck-agent",
  "tags": ["dark", "executive", "premium", "corporate"],
  "mode": "dark",
  "palette": {
    "background": "#0f1419",
    "surface": "#17202b",
    "text": "#f5f7fb",
    "accent1": "#667eea",
    "accent2": "#ffd700"
  },
  "slideVariants": ["lead", "gradient", "light"],
  "supportedLayouts": ["hero", "content", "two-column", "stat", "flow", "table", "cta"]
}
```

## Adding a new template

1. Create a directory under `templates/`:
   ```
   templates/my-template/
   ├── theme.css       # Must start with /* @theme my-template */
   ├── preview.md      # Sample 3-5 slide deck using the theme
   └── metadata.json   # Template metadata (see schema above)
   ```

2. Register in `.vscode/settings.json`:
   ```json
   { "markdown.marp.themes": ["./templates/my-template/theme.css"] }
   ```

3. Render the preview to verify:
   ```bash
   npx @marp-team/marp-cli --theme-set ./templates/ templates/my-template/preview.md
   ```

4. The template will automatically appear in the registry when the agent reads this skill.

## Render with templates

All render commands should include `--theme-set ./templates/` to make custom themes available:

```bash
npx @marp-team/marp-cli --theme-set ./templates/ deck.md
npx @marp-team/marp-cli --theme-set ./templates/ --pdf deck.md
npx @marp-team/marp-cli --theme-set ./templates/ --pptx deck.md
```
