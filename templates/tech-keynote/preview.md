---
marp: true
theme: tech-keynote
size: 16:9
paginate: true
---

<!-- _class: lead -->

<div class="eyebrow">PRODUCT LAUNCH</div>

# Tech Keynote Theme
## Bold technical presentation template

<div class="badge-row">
  <div class="badge">v2.0</div>
  <div class="badge">Open Source</div>
  <div class="badge">GA Release</div>
</div>

---

# What's New

## Key features in this release

- **Blazing fast** — 10x performance improvement on cold starts
- **Zero config** — Works out of the box with sensible defaults
- **Type safe** — Full TypeScript support with inference
- **Extensible** — Plugin system for custom workflows

<div class="terminal">npm install @acme/framework@latest</div>

---

# Architecture

<div class="columns">
<div class="panel">

### Frontend

- React 19 + Server Components
- Edge-first rendering
- `< 50ms` TTFB globally

</div>
<div class="panel">

### Backend

- Rust core, Node.js bindings
- Auto-scaling workers
- `99.99%` uptime SLA

</div>
</div>

---

<!-- _class: code -->

# Quick Start

```typescript
import { createApp } from '@acme/framework';

const app = createApp({
  routes: './routes',
  middleware: ['auth', 'logging'],
});

app.listen(3000);
// Ready in 12ms
```

---

<!-- _class: lead -->

# Ship It

## Available now on npm

<div class="badge-row">
  <div class="badge">docs.acme.dev</div>
  <div class="badge">github.com/acme</div>
</div>
