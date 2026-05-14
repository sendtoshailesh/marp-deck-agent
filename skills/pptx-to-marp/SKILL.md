---
name: pptx-to-marp
description: 'Convert PowerPoint (.pptx) files to Marp markdown decks. Extracts themes, colors, fonts, slide content, images, and speaker notes. USE FOR: importing PPT, converting PPTX, extracting PPT theme, migrating slides to Marp.'
---

# PPTX to Marp Conversion

Convert PowerPoint presentations to professional Marp markdown decks.

## Overview

A `.pptx` file is a ZIP archive containing Office Open XML files. This skill uses two scripts:

1. **`scripts/extract-pptx-theme.js`** — Extracts the color scheme, fonts, and slide dimensions from the PowerPoint theme XML
2. **`scripts/convert-pptx-slides.js`** — Converts each slide's content (text, images, notes) to Marp markdown

## Usage

### Step 1: Extract theme

```bash
node scripts/extract-pptx-theme.js <input.pptx> [output-tokens.json]
```

**Output:** A `tokens.json` file containing:

```json
{
  "colors": {
    "dark1": "#000000",
    "light1": "#FFFFFF",
    "dark2": "#44546A",
    "light2": "#E7E6E6",
    "accent1": "#4472C4",
    "accent2": "#ED7D31",
    "accent3": "#A5A5A5",
    "accent4": "#FFC000",
    "accent5": "#5B9BD5",
    "accent6": "#70AD47",
    "hyperlink": "#0563C1",
    "followedHyperlink": "#954F72"
  },
  "fonts": {
    "major": "Calibri Light",
    "minor": "Calibri"
  },
  "slideSize": {
    "width": 12192000,
    "height": 6858000,
    "aspect": "16:9"
  }
}
```

### Step 2: Convert slides

```bash
node scripts/convert-pptx-slides.js <input.pptx> <output-dir>
```

**Output:** A directory containing:

```
output-dir/
├── deck.md          # Full Marp markdown deck
├── theme.css        # Generated Marp theme from extracted tokens
├── images/          # Extracted images from ppt/media/
│   ├── image1.png
│   └── image2.jpg
└── tokens.json      # Design tokens (same as step 1)
```

## PowerPoint layout to Marp class mapping

| PPT Layout Type | Marp Equivalent | CSS Class |
|---|---|---|
| Title Slide | Hero slide | `<!-- _class: lead -->` |
| Title Only | Content with H1 only | (default) |
| Two Content | Two-column grid | Use `.columns` with two `.panel` blocks |
| Section Header | Gradient divider | `<!-- _class: gradient -->` |
| Comparison | Side-by-side panels | Use `.columns` |
| Blank | Custom layout | (default, no auto-content) |
| Title and Content | Standard content slide | (default) |
| Content with Caption | Content + note | (default) + `.note` paragraph |
| Picture with Caption | Background image slide | `![bg](image)` + caption |

## Shape to markdown mapping

| PPT Shape | Marp Markdown |
|---|---|
| Title placeholder | `# Title Text` |
| Subtitle placeholder | `## Subtitle Text` |
| Body text (bullets) | `- Bullet point` |
| Body text (numbered) | `1. Numbered item` |
| Table | Markdown table (`\| Col \|`) |
| Image/picture | `![w:NNN](./images/filename.ext)` |
| SmartArt | Flatten to bullet list with note: `<!-- SmartArt flattened -->` |
| Chart | Skip with placeholder: `<!-- Chart: [chart title] — recreate manually -->` |
| Grouped shapes | Flatten to sequential elements |
| Text box (standalone) | Wrap in `<div class="panel">` |

## Color resolution

PowerPoint themes use indirect color references (`schemeClr`) that must be resolved:

```xml
<!-- In slide XML -->
<a:solidFill>
  <a:schemeClr val="accent1"/>  <!-- References theme color -->
</a:solidFill>
```

The extraction script resolves these by:
1. Reading `ppt/theme/theme1.xml` for the color scheme definition
2. Building a lookup map: `{ "dk1": "#000000", "lt1": "#FFFFFF", "accent1": "#4472C4", ... }`
3. Replacing all `schemeClr` references with resolved RGB values

### Color luminance mapping

When generating a Marp theme from PPT tokens:

```
dk1 → --bg-primary (dark theme) OR --text-primary (light theme)
lt1 → --text-primary (dark theme) OR --bg-primary (light theme)
accent1 → --accent-primary
accent2 → --accent-strong (if darker) OR --accent-gold (if warm)
accent3-6 → additional palette entries
```

Determine dark vs light mode by comparing dk1 and lt1 luminance.

## Font mapping

PowerPoint defines `major` (headings) and `minor` (body) font families. Map to Marp CSS:

```css
section {
  font-family: '<minor-font>', system-ui, sans-serif;
}
section h1, section h2, section h3 {
  font-family: '<major-font>', system-ui, sans-serif;
}
```

If the PPT fonts are not web-safe, fall back to the closest system font.

## Speaker notes extraction

Notes are stored in `ppt/notesSlides/notesSlideN.xml`. The script extracts text from `<a:t>` elements within the notes shape and converts them to Marp speaker note comments:

```markdown
<!-- 
Speaker notes from original PowerPoint:
- First talking point
- Second talking point
-->
```

## Edge cases

1. **Embedded videos/audio:** Skip with placeholder comment
2. **Animations/transitions:** Ignore (Marp is static)
3. **Master slide backgrounds:** Extract solid colors and gradients; skip complex image backgrounds with a note
4. **Hyperlinks:** Convert to markdown links `[text](url)`
5. **Slide numbers > 20:** Consider suggesting the user consolidate — very long decks lose audience attention
6. **Password-protected PPTX:** Cannot extract — inform the user to remove protection first
7. **Macro-enabled (.pptm):** Treat as regular .pptx but warn that macros are discarded
