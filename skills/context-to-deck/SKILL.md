---
name: context-to-deck
description: 'Build a pixel-perfect PowerPoint deck (.pptx + .pdf) from an input context file (md/txt/pdf/docx/pptx) using an existing PowerPoint as the design template. Preserves source masters, layouts, footers, logos, and theme. USE FOR: creating a presentation from a document, applying a corporate template to new content, converting source material to a branded deck.'
---

# Context-to-Deck

Generate a presentation deck that *looks like the user's source PowerPoint* but contains *new content from a context file*.

## Architecture

```
context file (md/txt/pdf/docx/pptx)
        │
        ▼
   ingest-context.js  ──▶  outline.json
                              │
template.pptx                 │
        │                     │
        ▼                     │
extract-pptx-template.py ──▶ template-manifest.json
                              │
                              ▼
                       [agent plans slides]
                              │
                              ▼
                          plan.json
                              │
                              ▼
              build-pptx-from-template.py
                              │
                              ▼
                         output.pptx
                              │
                              ▼
                      pptx-to-pdf.sh
                              │
                              ▼
                         output.pdf
```

## Required inputs

1. **Context file** — `.md`, `.txt`, `.pdf`, `.docx`, or `.pptx`. Programmatically read for headings, paragraphs, bullets, tables, and images.
2. **Template PPTX** — an existing PowerPoint file whose masters, layouts, footers, and theme will be reused.
3. **Interview answers** — collected once via the `build-deck-from-context` prompt (single form).

## Tools

| Script | Purpose | Runtime |
|---|---|---|
| `scripts/ingest-context.js` | Parse context file → `outline.json` | Node |
| `scripts/extract-pptx-template.py` | Inspect template → `template-manifest.json` | Python (python-pptx) |
| `scripts/build-pptx-from-template.py` | Clone template + inject planned slides → `output.pptx` | Python (python-pptx) |
| `scripts/pptx-to-pdf.sh` | Convert PPTX → PDF | LibreOffice headless |

## Slide plan schema

The agent produces `plan.json` consumed by `build-pptx-from-template.py`:

```json
{
  "metadata": {
    "title": "...",
    "subtitle": "...",
    "author": "...",
    "audience": "executives | technical | sales | training",
    "tone": "formal | conversational | persuasive | instructional"
  },
  "template": "/abs/path/template.pptx",
  "output_pptx": "/abs/path/output.pptx",
  "slides": [
    {
      "role": "title",
      "title": "Deck title",
      "subtitle": "One-line value prop",
      "notes": "Speaker notes auto-generated from context."
    },
    {
      "role": "section",
      "title": "Section divider",
      "notes": "..."
    },
    {
      "role": "content",
      "title": "Slide title",
      "body": ["Bullet 1", "Bullet 2", "Bullet 3"],
      "notes": "..."
    },
    {
      "role": "two_content",
      "title": "Side-by-side",
      "body_left": ["Left bullet 1", "Left bullet 2"],
      "body_right": ["Right bullet 1", "Right bullet 2"],
      "notes": "..."
    },
    {
      "role": "content",
      "title": "Data slide",
      "tables": [{"headers": ["Q1","Q2","Q3"], "rows": [["10","20","30"]]}],
      "notes": "..."
    },
    {
      "role": "content",
      "title": "Chart slide",
      "charts": [{
        "type": "column",
        "title": "Revenue by quarter",
        "categories": ["Q1","Q2","Q3","Q4"],
        "series": [{"name": "2025", "values": [10, 20, 30, 40]}]
      }],
      "notes": "..."
    },
    {
      "role": "picture",
      "title": "Visual moment",
      "images": [{"path": "/abs/path/extracted/img1.png"}],
      "notes": "..."
    }
  ]
}
```

## Layout role mapping

The builder finds the closest matching layout in the template using `role` and falls back to layout-name heuristics, then to default indices:

| Role | Match priority |
|---|---|
| `title` | name contains "title slide" → layout 0 |
| `section` | name contains "section" → layout 2 |
| `content` | name contains "title and content" / "content" → layout 1 |
| `two_content` | name contains "two" → layout 3 |
| `comparison` | name contains "comparison" → layout 4 |
| `title_only` | name contains "title only" → layout 5 |
| `blank` | name contains "blank" → layout 6 |
| `picture` | name contains "picture" / "caption" → layout 8 |

You may also supply `layout_index` in a slide to force a specific layout.

## Default behavior

1. **Deck length** — driven by context word count:
   - < 500 words → 5–7 slides
   - 500–1500 words → 8–12 slides
   - 1500–4000 words → 12–18 slides
   - 4000+ words → 18–25 slides, suggest consolidation
2. **Section dividers** — auto-insert before each top-level (`level 1`) section in the outline.
3. **Speaker notes** — auto-generate from the source paragraphs of each section (3–5 sentences each).
4. **Images** — reuse images extracted from the context (PDF figures, DOCX images, PPTX media); fill remaining slides with `picture` layout placeholders.
5. **Tables / charts** — render natively in the output PPTX using python-pptx (not as images).
6. **Tone / audience** — always asked in the interview form; never assumed.

## Execution flow

1. Run `ingest-context.js` against the user's context file → `outline.json`.
2. Run `extract-pptx-template.py` against the template → `template-manifest.json`.
3. Present the single interview form (see `build-deck-from-context` prompt) and collect answers.
4. **Plan slides:** Combine outline + manifest + answers into `plan.json`. Match each outline section to a layout role; map images, tables, charts; draft speaker notes.
5. Show the plan to the user as a numbered slide list for one-shot approval.
6. Run `build-pptx-from-template.py plan.json` → `output.pptx`.
7. Run `pptx-to-pdf.sh output.pptx` → `output.pdf`.
8. Report both file paths.

## Dependencies

- Node 20+: `pdf-parse`, `mammoth`, `adm-zip`, `fast-xml-parser` (already in package.json after this skill is installed).
- Python 3.10+ with `pip install -r scripts/requirements.txt` (python-pptx, Pillow).
- LibreOffice (only for PPTX→PDF; optional if PDF not requested).
