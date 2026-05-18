# marp-deck-agent

A toolkit for generating professional slide decks two ways:

1. **Marp-based decks** — Markdown → HTML / PDF / PPTX via [Marp](https://marp.app), with built-in themes, PPTX import, and URL-based theme extraction.
2. **Pixel-perfect PPTX decks** — feed a context file (md/txt/pdf/docx/pptx) + an existing PowerPoint template; get a `.pptx` that inherits the template's masters, layouts, footers, logos, and theme.

Designed to be invoked from GitHub Copilot Chat as a plugin, but every step is a plain CLI script you can also run by hand.

---

## Features

### Deck generation
- **From a brief or topic** — `/generate-deck` prompt produces a Marp deck of any length and tone.
- **From context + template (pixel-perfect)** — `/build-deck-from-context` ingests a document, scans a `.pptx` for layouts, plans slides, builds the deck against the template's actual layouts, and optionally renders PDF.

### Imports & extraction
- **PPTX → Marp** — convert an existing `.pptx` into Markdown slides.
- **PPTX → manifest** — deep scan of masters, layouts, placeholders (EMU + px), theme colors and fonts.
- **URL → tokens** — extract colors, fonts, spacing, and shadows from any website and emit a matching Marp theme.

### Authoring & export
- **Built-in templates** — `executive-dark`, `corporate-light`, `tech-keynote`.
- **Custom templates** — drop a `theme.css` + `preview.md` into `templates/` and register it.
- **Multi-format render** — Marp CLI exports to HTML, PDF, PPTX; LibreOffice headless converts PPTX → PDF for the pixel-perfect path.

### Context ingestion
- Supports `.md`, `.txt`, `.pdf`, `.docx`, `.pptx`.
- Parses headings, bullets, Markdown / HTML / Word tables, images, and inline code.
- Optional image extraction from `.docx` via `--images-dir`.

---

## Built-in Marp templates

| Template | Mode | Best for |
|---|---|---|
| `executive-dark` | Dark | Executive briefings, board decks |
| `corporate-light` | Light | Corporate reports, client presentations |
| `tech-keynote` | Dark | Product launches, developer conferences |

---

## Installation

Clone into your Copilot plugins directory:

```bash
git clone https://github.com/shaileshmishra/marp-deck-agent.git \
  .copilot/installed-plugins/marp-deck-agent
```

Or add as a Git submodule:

```bash
git submodule add https://github.com/shaileshmishra/marp-deck-agent.git \
  .copilot/installed-plugins/marp-deck-agent
```

### One-time dependency setup

| What | When you need it | Install |
|---|---|---|
| Node deps | All flows | `npm install` |
| Python deps (`python-pptx`, `Pillow`) | Pixel-perfect PPTX flow | `pip install -r scripts/requirements.txt` |
| LibreOffice (headless) | PPTX → PDF in pixel-perfect flow | `brew install --cask libreoffice` (macOS) · `sudo apt install libreoffice` (Debian/Ubuntu) |
| Chrome/Chromium | Marp PDF / PPTX export and URL token extraction | `npx puppeteer browsers install chrome` (or use system Chrome) |

Or use the bundled npm shortcuts:

```bash
npm install            # Node deps
npm run py-deps        # python-pptx + Pillow
```

---

## Quick start — pixel-perfect PPTX from a doc + template

```bash
# 1. Ingest your source doc into a structured outline
node scripts/ingest-context.js ./docs/q4-results.pdf ./build/outline.json

# 2. Extract the template's masters, layouts, and theme
python3 scripts/extract-pptx-template.py ./brand/template.pptx ./build/template-manifest.json

# 3. Author a plan.json that maps content to layouts (schema below).
#    A Copilot prompt can do this for you, or hand-write it.

# 4. Build the PPTX by cloning the template
python3 scripts/build-pptx-from-template.py ./build/plan.json --out ./build/deck.pptx

# 5. (Optional) Convert to PDF
bash scripts/pptx-to-pdf.sh ./build/deck.pptx ./build/
```

### From Copilot Chat

```
/build-deck-from-context
Context: ./docs/q4-results.pdf
Template: ./brand/corporate-template.pptx
```

The agent runs a one-shot interview (audience, tone, objective, must-include, exclusions, author, output dir, PDF yes/no, slide count, image strategy), then executes steps 1–5 above and shows you the plan before building.

### plan.json schema

```jsonc
{
  "metadata": { "title": "...", "subtitle": "...", "author": "...", "audience": "...", "tone": "concise" },
  "template": "./brand/template.pptx",
  "output_pptx": "./build/deck.pptx",
  "slides": [
    { "role": "title",   "title": "Q2 Strategy", "subtitle": "Quarterly review" },
    { "role": "section", "title": "Where we are" },
    { "role": "content", "title": "Q1 Highlights", "body": ["Bullet A", "Bullet B"] },
    {
      "role": "content", "title": "Key Metrics",
      "tables": [{ "headers": ["Metric","Q1","Q2"], "rows": [["MAU","42k","60k"]] }]
    },
    {
      "role": "content", "title": "Targets",
      "charts": [{
        "type": "column",
        "categories": ["MAU","NPS"],
        "series": [{"name":"Q1","values":[42,38]}, {"name":"Q2","values":[60,45]}]
      }]
    },
    { "role": "two_content", "title": "Compare",
      "body_left": ["L1","L2"], "body_right": ["R1","R2"] },
    { "role": "content", "title": "Ask", "body": ["Approve plan"], "notes": "Speaker note" }
  ]
}
```

Supported `role` values (matched to template layouts): `title`, `section`, `content`, `two_content`, `comparison`, `picture`, `title_only`, `blank`. Override layout selection with `"layout_index": N`.

Per-slide fields: `title`, `subtitle`, `body` (string or list), `body_left`, `body_right`, `images` (`[{path, left?, top?, width?, height?}]`), `tables`, `charts` (`bar|column|line|pie`), `notes`.

---

## Quick start — Marp deck from a brief

```
/generate-deck Create a 10-slide executive briefing on our Q4 cloud migration results
```

Or run by hand:

```bash
bash scripts/render-deck.sh deck.md --all
# Flags: --html | --pdf | --pptx | --all
```

---

## Copilot prompts

| Prompt | Purpose |
|---|---|
| `/generate-deck` | Author a Marp deck from a brief, topic, or outline |
| `/build-deck-from-context` | Pixel-perfect PPTX from a doc + template (full pipeline) |
| `/import-from-pptx` | Convert a `.pptx` to Marp markdown |
| `/import-from-url` | Extract design tokens from a website and emit a Marp theme |
| `/apply-template` | Restyle an existing deck with a built-in template |

---

## Script reference

| Script | Input | Output | Notes |
|---|---|---|---|
| `scripts/ingest-context.js <file> <out.json>` | `.md` `.txt` `.pdf` `.docx` `.pptx` | structured outline JSON | Add `--images-dir <dir>` to extract `.docx` images |
| `scripts/extract-pptx-template.py <in.pptx> <out.json>` | `.pptx` | template manifest (masters, layouts, theme, role_map) | Used by the planner |
| `scripts/build-pptx-from-template.py <plan.json> --out <deck.pptx>` | plan + template referenced inside | `.pptx` | Add `--keep-template-slides` to preserve existing slides |
| `scripts/pptx-to-pdf.sh <in.pptx> [out-dir]` | `.pptx` | `.pdf` | Requires LibreOffice |
| `scripts/extract-pptx-theme.js <in.pptx> <out.json>` | `.pptx` | theme tokens (colors, fonts) | For Marp theme generation |
| `scripts/convert-pptx-slides.js <in.pptx> <out-dir>` | `.pptx` | Marp `.md` + assets | PPTX → Marp import |
| `scripts/extract-url-tokens.js <url> <out-dir>` | URL | tokens.json + Marp theme | Uses Puppeteer |
| `scripts/render-deck.sh <deck.md> [--html\|--pdf\|--pptx\|--all]` | Marp `.md` | rendered files | Wraps `@marp-team/marp-cli` |

### npm shortcuts

```bash
npm run ingest-context -- <file> <out.json>
npm run extract-template -- <in.pptx> <out.json>
npm run build-pptx -- <plan.json> --out <deck.pptx>
npm run pptx-to-pdf -- <in.pptx> [out-dir]
npm run py-deps                       # install python-pptx + Pillow
```

---

## End-to-end example

A complete walkthrough using the bundled scripts:

```bash
# Sample inputs at /tmp/deck-run/
mkdir -p /tmp/deck-run && cd /tmp/deck-run

# Use any .pptx as the brand template; here we generate a minimal one
python3 - <<'PY'
from pptx import Presentation; from pptx.util import Inches
p = Presentation(); p.slide_width=Inches(13.333); p.slide_height=Inches(7.5)
p.save("template.pptx")
PY

# Write a context doc
cat > context.md <<'MD'
# Q2 Review
## Highlights
- Shipped feature X
- Cut latency 50%
## Ask
- Approve mobile pod
MD

# Pipeline
node /path/to/marp-deck-agent/scripts/ingest-context.js context.md outline.json
python3 /path/to/marp-deck-agent/scripts/extract-pptx-template.py template.pptx template-manifest.json
# (author plan.json — see schema above)
python3 /path/to/marp-deck-agent/scripts/build-pptx-from-template.py plan.json --out deck.pptx
bash /path/to/marp-deck-agent/scripts/pptx-to-pdf.sh deck.pptx .
```

---

## Adding a Marp template

Create a directory under `templates/` with three files:

```
templates/my-template/
├── theme.css        # Must start with /* @theme my-template */
├── preview.md       # Sample 3–5 slide deck
└── metadata.json    # Template metadata
```

Register it in `.vscode/settings.json`:

```json
{
  "markdown.marp.themes": [
    "./templates/my-template/theme.css"
  ]
}
```

---

## Project structure

```
.github/
  agents/              # Copilot agent definitions
  instructions/        # Marp authoring rules
  plugin/              # Plugin manifest
  prompts/             # User-facing prompt templates
scripts/
  ingest-context.js              # md/txt/pdf/docx/pptx → outline.json
  extract-pptx-template.py       # pptx → template manifest
  build-pptx-from-template.py    # plan.json + template → deck.pptx
  pptx-to-pdf.sh                 # LibreOffice headless converter
  extract-pptx-theme.js          # pptx → theme tokens
  convert-pptx-slides.js         # pptx → Marp markdown
  extract-url-tokens.js          # URL → theme tokens
  render-deck.sh                 # Marp CLI wrapper
  requirements.txt               # Python deps
skills/                # Domain knowledge for the agent
templates/             # Built-in Marp themes
  executive-dark/
  corporate-light/
  tech-keynote/
```

---

## Requirements

- Node.js 18+ (20+ recommended)
- Python 3.9+ (for the pixel-perfect PPTX flow)
- VS Code with GitHub Copilot (for chat prompts; not required for CLI)
- Chrome/Chromium — for Marp PDF / PPTX export and URL extraction
- LibreOffice (optional) — for PPTX → PDF in the pixel-perfect flow

---

## License

MIT
