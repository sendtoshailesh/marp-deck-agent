# marp-deck-agent

GitHub Copilot plugin for generating professional slide decks with [Marp](https://marp.app).

## What it does

- **Generate decks** from a topic, brief, or outline
- **Import from PowerPoint** — convert `.pptx` files to Marp markdown
- **Import from URL** — extract design tokens from any website and generate a matching theme
- **Apply templates** — restyle existing decks with built-in professional themes
- **Export** to HTML, PDF, and PPTX via Marp CLI

## Built-in templates

| Template | Mode | Best for |
|---|---|---|
| `executive-dark` | Dark | Executive briefings, board decks |
| `corporate-light` | Light | Corporate reports, client presentations |
| `tech-keynote` | Dark | Product launches, developer conferences |

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

Then install dependencies (needed for PPTX conversion and URL extraction):

```bash
cd .copilot/installed-plugins/marp-deck-agent
npm install
```

## Usage

### Generate a deck

In VS Code chat, use the prompt:

```
/generate-deck Create a 10-slide executive briefing on our Q4 cloud migration results
```

### Import from PowerPoint

```
/import-from-pptx Convert ./presentations/quarterly-review.pptx to Marp
```

### Import design from a website

```
/import-from-url Extract the design from https://github.com and create a matching deck theme
```

### Apply a template

```
/apply-template Restyle my deck.md with the tech-keynote template
```

## Scripts

Run these directly when not using the Copilot agent:

```bash
# Extract theme tokens from a .pptx file
node scripts/extract-pptx-theme.js presentation.pptx tokens.json

# Convert a full .pptx to Marp markdown
node scripts/convert-pptx-slides.js presentation.pptx ./output/

# Extract design tokens from a website
node scripts/extract-url-tokens.js https://example.com ./output/

# Render a deck (--html, --pdf, --pptx, or --all)
bash scripts/render-deck.sh deck.md --all
```

## Adding templates

Create a directory under `templates/` with three files:

```
templates/my-template/
├── theme.css        # Must start with /* @theme my-template */
├── preview.md       # Sample 3-5 slide deck
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

## Project structure

```
.github/
  agents/              # Copilot agent definitions
  instructions/        # Marp authoring rules
  plugin/              # Plugin manifest
  prompts/             # User-facing prompt templates
scripts/               # Node.js extraction and render scripts
skills/                # Domain knowledge for the agent
templates/             # Built-in presentation themes
  executive-dark/
  corporate-light/
  tech-keynote/
```

## Requirements

- Node.js 18+
- VS Code with GitHub Copilot
- Chrome/Chromium (for PDF/PPTX export and URL extraction)

## License

MIT
