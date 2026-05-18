---
mode: agent
description: 'Build a pixel-perfect PPTX (and PDF) from a context file using an existing PowerPoint as the design template'
agent: marp-deck-generator
---

# Build Deck from Context

Create a presentation that **looks like the user's template PPTX** and contains **new content from their context file**.

## Input

{{{ input }}}

## Required artifacts from the user

The user must provide:

1. **Context file** — path to `.md`, `.txt`, `.pdf`, `.docx`, or `.pptx`
2. **Template PPTX** — path to a `.pptx` whose masters/layouts/theme will be reused

If either is missing in the input, ask once for both.

## Single-form interview

Once both files are confirmed, present the user with **ONE** message containing all of the following questions. The user answers in a single reply.

```
Before I plan the deck, please answer all of the following in one message:

1. **Audience** — who is this for? (e.g., executives, technical team, customers, internal training)
2. **Tone** — formal / conversational / persuasive / instructional?
3. **Primary objective** — what should the audience think, feel, or do after the deck?
4. **Must-include slides or content** — anything that absolutely must appear?
5. **Things to exclude** — any topics, sections, or images to leave out?
6. **Author / presenter name** (for the title slide and metadata)
7. **Output location** — directory to write `output.pptx` and `output.pdf` into
8. **Generate PDF too?** — yes / no (requires LibreOffice installed)
9. **Slide-count preference** — auto (driven by context length) or a specific number?
10. **Image strategy** — reuse context images only / placeholders only / both (default: both)
```

Do not assume answers. If a user skips a question, ask for it explicitly before planning.

## Pipeline

After answers are collected:

### 1. Ingest context

```bash
node scripts/ingest-context.js <context-file> <work-dir>/outline.json --images-dir <work-dir>/context-images
```

### 2. Extract template manifest

Requires `python-pptx`. If not installed:
```bash
pip install -r scripts/requirements.txt
```

```bash
python3 scripts/extract-pptx-template.py <template.pptx> <work-dir>/template-manifest.json
```

### 3. Plan slides

Read `outline.json` and `template-manifest.json`. Produce `plan.json` following the schema in the `context-to-deck` skill. Rules:

- **Title slide** (role: `title`): use context title + a one-line value prop derived from objective.
- **Section dividers** (role: `section`): one before each top-level heading in the outline.
- **Content slides** (role: `content`): one per subsection, with 3–6 bullets each. Keep bullets ≤ 12 words.
- **Two-column** (role: `two_content`): use when a section has parallel ideas (pros/cons, before/after, etc.).
- **Tables / charts**: render natively. If the context contains a table, include it as a `tables` entry; if it suggests a chart (numeric series), build a `charts` entry.
- **Pictures**: pair extracted context images with a `picture` layout slide.
- **Speaker notes**: 3–5 sentences per content slide, drawn from the source paragraphs.
- **Closing slide** (role: `content` or template's closing layout): summary + CTA tied to the user's objective.

Deck length defaults:

| Context word count | Target slides |
|---|---|
| < 500 | 5–7 |
| 500–1500 | 8–12 |
| 1500–4000 | 12–18 |
| 4000+ | 18–25 (suggest consolidation) |

### 4. Confirm plan

Show the user a numbered list of slides:

```
Plan (14 slides):
 1. [title] "Deck title"
 2. [section] Background
 3. [content] Why this matters — 4 bullets
 4. [two_content] Current state vs. target state
 5. [content] Data — quarterly table
 6. [content] Trend — column chart
 ...
```

Ask: "Approve, edit (which slide?), or regenerate?"

### 5. Build PPTX

```bash
python3 scripts/build-pptx-from-template.py <work-dir>/plan.json
```

### 6. Build PDF (only if requested in interview)

```bash
bash scripts/pptx-to-pdf.sh <output-dir>/output.pptx
```

### 7. Report

Print the absolute paths of `output.pptx` and (if generated) `output.pdf`.

## Failure handling

- **python-pptx missing** → instruct: `pip install -r scripts/requirements.txt`
- **LibreOffice missing** for PDF → tell the user the command to install it on macOS/Linux; deliver the PPTX anyway and skip PDF.
- **Template has unusual layouts** → fall back to the closest match using `template-manifest.json`'s `role_map`; warn the user about any layout substitutions.
- **Image dimensions exceed slide** → builder auto-fits to 40% width on the right side.

## Rules

- One slide per major idea — never cram.
- Bullets ≤ 12 words; max 6 bullets per content slide.
- Always include speaker notes on content slides.
- Never invent data, statistics, or quotes that are not in the context file.
- Never modify the template's masters or theme — only inject content into existing layouts.
