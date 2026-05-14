---
name: marp-deck-design
description: 'Marp CSS design system, layout recipes, typography scale, and content density rules for professional slide decks. USE FOR: creating slides, styling decks, choosing layouts, fixing overflow, designing slide visuals.'
---

# Marp Deck Design System

Complete design system reference for creating professional Marp slide decks.

## Slide dimensions

- **16:9 (default):** 1280 × 720px
- **4:3:** 960 × 720px
- Base font size: 26–28px for 16:9; reduce to 24px for dense slides
- Padding: 48px top/bottom, 56px left/right (adjust in theme CSS via `section` padding)

## Custom theme structure

Every custom Marp theme CSS file must start with a `@theme` metadata comment:

```css
/* @theme my-theme-name */
```

This registers the theme name so it can be referenced in frontmatter as `theme: my-theme-name`.

### Core selectors

```css
/* Targets every slide */
section {
  background: #0f1419;
  color: #f5f7fb;
  font-size: 26px;
  padding: 48px 56px;
  line-height: 1.3;
}

/* Heading hierarchy */
section h1 { font-size: 1.8em; margin-bottom: 0.2em; }
section h2 { font-size: 1.0em; margin-bottom: 0.5em; }
section h3 { font-size: 0.95em; margin: 0.2em 0 0.4em; }

/* Slide variant classes */
section.lead { /* hero / title slide */ }
section.gradient { /* gradient background slide */ }
section.light { /* light-mode slide */ }
```

## Color palettes

### Dark mode palette (recommended for executive decks)

```css
:root {
  --bg-primary: #0f1419;
  --bg-surface: #17202b;
  --bg-panel: rgba(255, 255, 255, 0.08);
  --border-panel: rgba(255, 255, 255, 0.14);
  --text-primary: #f5f7fb;
  --text-secondary: #c0cad7;
  --text-muted: #8b949e;
  --accent-primary: #667eea;     /* Blue-purple */
  --accent-strong: #764ba2;      /* Deep purple */
  --accent-gold: #ffd700;        /* Gold highlights */
  --accent-soft: #ffe14d;        /* Light gold */
}
```

### Light mode palette

```css
:root {
  --bg-primary: #f7f9fc;
  --bg-surface: #ffffff;
  --bg-panel: rgba(255, 255, 255, 0.92);
  --border-panel: rgba(79, 106, 230, 0.14);
  --text-primary: #18212e;
  --text-secondary: #526277;
  --text-muted: #8b949e;
  --accent-primary: #4f6ae6;
  --accent-strong: #3a56d4;
  --accent-gold: #d4a017;
}
```

## Typography scale

| Element | Size | Weight | Use |
|---------|------|--------|-----|
| H1 | 1.8em (47px) | 800 | Slide title — one per slide |
| H2 | 1.02em (27px) | 600 | Subtitle — directly after H1 |
| H3 | 0.95em (25px) | 700 | Section headers in panels/cards |
| Body | 1.0em (26px) | 400 | Default paragraph text |
| Small | 0.72em (19px) | 400 | Notes, captions, badges |
| Tiny | 0.66em (17px) | 400 | Minimum readable — footer, labels |

### Rules

- Never go below 0.66em (about 17px at base 26)
- Titles use letter-spacing: -0.02em for tighter feel
- Body uses line-height: 1.25–1.35

## Layout recipes

### Two-column layout

```html
<div class="columns">
<div class="panel">

### Left heading

- Point one
- Point two

</div>
<div class="panel">

### Right heading

- Point three
- Point four

</div>
</div>
```

```css
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
}
```

### Panel (glass card)

```css
.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-panel);
  border-radius: 18px;
  padding: 20px 22px;
  backdrop-filter: blur(10px);
}
```

### Metric / stat block

```html
<div class="metric">
<strong>73%</strong>
teams wait days for infrastructure changes
</div>
```

```css
.metric {
  background: linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%);
  border: 1px solid var(--border-panel);
  border-radius: 18px;
  padding: 18px 20px;
}
.metric strong {
  display: block;
  font-size: 1.6em;
  color: var(--accent-gold);
}
```

### Flow / process diagram

```html
<div class="flow">
<div class="flow-box">

### Step 1

Description

</div>
<div class="arrow">→</div>
<div class="flow-box">

### Step 2

Description

</div>
<div class="arrow">→</div>
<div class="flow-box">

### Step 3

Description

</div>
</div>
```

```css
.flow {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 12px;
  align-items: center;
}
.flow-box {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}
.arrow {
  color: var(--accent-gold);
  font-size: 1.1em;
  font-weight: 700;
}
```

### Badge row

```html
<div class="badge-row">
  <div class="badge">Label 1</div>
  <div class="badge">Label 2</div>
  <div class="badge">Label 3</div>
</div>
```

```css
.badge-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 0.65em; }
.badge {
  background: rgba(255, 215, 0, 0.12);
  color: #ffe89a;
  border: 1px solid rgba(255, 215, 0, 0.28);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.64em;
  font-weight: 700;
}
```

### Hero / title layout

```html
<div class="hero-grid">
<div>
<div class="eyebrow">CATEGORY</div>

# Main Title
## Subtitle

</div>
<div class="hero-card center">

![w:84](./logo.png)

### Tagline

<div class="pill">Tag 1</div><div class="pill">Tag 2</div>
</div>
</div>
```

### Icon grid (use emoji, not SVG)

```html
<div class="icon-grid">
<div class="icon-tile">
<span style="font-size:2em;display:block;margin-bottom:6px">🛡️</span>
<p>Security built in</p>
</div>
<div class="icon-tile">
<span style="font-size:2em;display:block;margin-bottom:6px">💰</span>
<p>Cost visibility</p>
</div>
</div>
```

## Slide type taxonomy

| Type | Class | Content limits | Use for |
|------|-------|----------------|---------|
| Hero | `lead` | Title + subtitle + 3 badges max | Opening, closing |
| Content | (default) | H1 + H2 + 6 bullets or 2 panels | Core message slides |
| Two-column | (default) | 2 `.panel` blocks, 4 items each | Comparisons, before/after |
| Stat | `gradient` | 2-3 `.metric` blocks | Data points, impact numbers |
| Flow | (default) | 3-5 `.flow-box` blocks | Process, timeline |
| Quote | `light` | Blockquote + attribution | Testimonials, key quotes |
| Demo | `gradient` | Title + description + 3-4 bullets | Live demo setup |
| Table | `light` | Max 5 rows × 4 columns | Feature matrix, comparison |
| CTA | `lead` | Title + 2-3 action items | Call to action, next steps |

## Decorative elements

### Background gradients

```css
/* Dark gradient (default) */
section { background: linear-gradient(135deg, #0f1419 0%, #1a252f 45%, #2c3e50 100%); }

/* Hero gradient */
section.lead { background: linear-gradient(135deg, #667eea 0%, #764ba2 48%, #f093fb 100%); }

/* Accent gradient */
section.gradient { background: linear-gradient(135deg, #121826 0%, #253247 50%, #764ba2 100%); }
```

### Ambient glow (pseudo-elements)

```css
section::before {
  content: "";
  position: absolute;
  inset: auto -8% -18% auto;
  width: 360px; height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.16) 0%, transparent 70%);
  pointer-events: none;
}
```

### Glass morphism panel

```css
.panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
}
```

## Image placement patterns

```markdown
<!-- Full background -->
![bg](./images/hero.jpg)

<!-- Right side, 40% width, dimmed -->
![bg right:40% opacity:0.3](./images/photo.jpg)

<!-- Left side, 50% width -->
![bg left:50%](./images/diagram.png)

<!-- Centered logo with explicit width -->
![w:120](./images/logo.png)

<!-- Multiple backgrounds (stacked) -->
![bg](./images/gradient.png)
![bg opacity:0.2](./images/pattern.png)
```

## Content density rules

These are hard limits to prevent overflow:

| Slide type | Max bullets | Max words/bullet | Max panels | Max nested levels |
|---|---|---|---|---|
| Hero | 3 badges | 3 words each | 1 card | 0 |
| Content | 6 | 30 | 2 | 2 |
| Two-column | 4 per panel | 20 | 2 | 1 |
| Stat | 0 (use metrics) | N/A | 3 | 0 |
| Flow | 0 (use flow-box) | 15 per box | 5 boxes | 0 |
| Table | 5 rows | 8 words/cell | 1 table | 0 |

If content exceeds these limits, split into multiple slides.
