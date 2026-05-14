---
description: "Marp markdown authoring rules — enforced when creating or editing Marp slide deck files"
applyTo: "**/*.md"
---

# Marp Authoring Rules

These rules apply when creating or editing Marp slide deck markdown files (files containing `marp: true` in frontmatter).

## Frontmatter

Every Marp deck must start with YAML frontmatter:

```yaml
---
marp: true
theme: <theme-name>
size: 16:9
paginate: true
footer: "<text>"
---
```

- `theme` must reference a registered theme from `templates/` or a Marp built-in (`default`, `gaia`, `uncover`)
- `size` should be `16:9` unless the user requests `4:3`
- Custom CSS goes in a `style: |` block inside the frontmatter

## Slide separators

- Use `---` on its own line to separate slides
- First content after frontmatter is slide 1 (no extra `---` needed)

## Directives

- **Global directives** go in frontmatter: `theme`, `size`, `paginate`, `header`, `footer`
- **Local directives** go in HTML comments at the top of a slide: `<!-- _class: lead -->`, `<!-- _paginate: false -->`
- Use `_class` to apply CSS class variants to individual slides

## Images

```markdown
<!-- Background image (fills slide) -->
![bg](./images/photo.jpg)

<!-- Background image with positioning -->
![bg right:40%](./images/photo.jpg)
![bg left:50% opacity:0.3](./images/photo.jpg)

<!-- Inline image with width -->
![w:200](./images/logo.png)

<!-- Inline image with height -->
![h:80](./images/icon.png)
```

- Always use relative paths from the deck file location
- Supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- Do NOT use `.pptx`, `.pdf`, or other non-image files as background sources

## HTML constraints

Marp sanitizes HTML by default. Only these elements render:

**Safe:** `<div>`, `<span>`, `<p>`, `<strong>`, `<em>`, `<br>`, `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`, `<img>`, `<blockquote>`, `<ul>`, `<ol>`, `<li>`, `<a>`, `<h1>`–`<h6>`, `<hr>`, `<code>`, `<pre>`

**Blocked (rendered as raw text):** `<svg>`, `<script>`, `<iframe>`, `<canvas>`, `<video>`, `<audio>`, `<object>`, `<embed>`, `<form>`, `<input>`

- Use Unicode emoji for icons instead of inline SVG
- Use `<div class="...">` for layout — Marp renders class-based divs correctly
- HTML blocks need a blank line before and after them to parse correctly

## Speaker notes

```markdown
<!-- 
Speaker notes go here.
They appear in presenter view but not on the slide.
Include timing and transition cues.
-->
```

- Place notes after slide content, before the `---` separator
- Every slide should have speaker notes

## Theme registration for VS Code preview

If using custom themes from `templates/`, ensure `.vscode/settings.json` includes:

```json
{
  "markdown.marp.themes": [
    "./templates/executive-dark/theme.css",
    "./templates/corporate-light/theme.css",
    "./templates/tech-keynote/theme.css"
  ]
}
```

## Render commands

```bash
# Render to HTML
npx @marp-team/marp-cli --theme-set ./templates/ deck.md

# Render to PDF
npx @marp-team/marp-cli --theme-set ./templates/ --pdf deck.md

# Render to PPTX
npx @marp-team/marp-cli --theme-set ./templates/ --pptx deck.md
```

## Common mistakes to avoid

1. **Using inline SVG** — Marp escapes SVG tags to raw text. Use emoji or image files.
2. **Forgetting blank lines around HTML blocks** — causes markdown-it to treat divs as inline text.
3. **Overloading slides** — more than 6 bullets or 2 column panels causes overflow. Marp clips at slide boundary.
4. **Using `style` attribute on elements** — Marp may strip inline styles. Use CSS classes defined in the theme or frontmatter `style` block.
5. **Background image from non-image files** — `![bg](file.pptx)` does not work. Only image formats are supported.
6. **Nesting too deep** — max 2 levels of bullet nesting. Deeper levels get clipped or misformatted.
