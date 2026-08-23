# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server (http://localhost:5173)
npm run build        # type-check + production build → dist/
npm run preview      # preview the built dist/
npm run photos       # process raw photos in photos/ (strip EXIF, compress, generate blurhash)
npm run rss          # regenerate public/rss.xml standalone (also runs automatically on build)
```

## Architecture

### Content pipeline

**Blog posts** live in `posts/*.md`. Each file is transformed into a Vue SFC by `unplugin-vue-markdown` — meaning you can use `<script setup>` and import/use Vue components directly inside markdown. Frontmatter fields: `title`, `date`, `description`, `tags[]`, `draft` (boolean).

`src/composables/usePosts.ts` exports two things:
- `usePosts()` — returns `{ allPosts }` as a **plain array**, not a ref. The list is built once at module scope from an **eager** `import.meta.glob` (frontmatter + raw text for search, no content rendered), and can never change at runtime, so nothing wraps it in a ref or computed. Derive from it directly.
- `postModules` — a **lazy** `import.meta.glob` used by `PostPage.vue` to dynamically load post content on navigation.

**Photos** drop zone is `photos/` (root). Raw files (no `p-` prefix) are gitignored. The `npm run photos` script (`scripts/photos-manage.ts`) processes them: reads EXIF capture date → strips all metadata → compresses → renames to `p-{iso-date}-{index}.{ext}` → outputs to `public/photos/` → generates blurhash sidecar `.json` files → writes `src/data/photos.json` manifest. The pre-commit hook (`.husky/pre-commit`) auto-runs this when committing.

**RSS** is generated as a Vite `closeBundle` plugin (in `vite.config.ts`) so `public/rss.xml` is always fresh after every build. The `generateRss` function in `scripts/generate-rss.ts` receives `siteConfig` as a parameter from `vite.config.ts` — do not make it re-import site config dynamically.

### State & routing

- Theme (light/dark, **default light**) lives in `src/composables/useTheme.ts` — module-level `shallowRef`, no store library. needle is a paper-first system, so light is the ground state and dark is the opt-in "ink mode". It is persisted to `localStorage` and applied as the `data-theme` attribute on `<html>`. `index.html` ships `data-theme="light"` in the tag and its inline script upgrades to `dark` **before first paint**; the composable only writes on change. If you touch either side, keep them in sync or ink-mode users get a paper flash.
- Router uses `createWebHashHistory` (hash URLs) so GitHub Pages needs no server config. There is deliberately **no** `<RouterView>` transition — `mode="out-in"` added dead time to every navigation.

### Styling

The whole visual layer is the **needle design system** (pulled from Claude Design, project `needle Design System`). Its own one-line brief: *minimal, warm, near-monochrome SaaS; distinctiveness comes from type; no gradients, no emoji, hairline borders before shadows.*

All tokens are CSS custom properties in `src/styles/main.css`, named exactly as needle names them so the code and the design system speak the same language:

- **Colour** — a warm greige ramp (`--paper` → `--sand` → `--ink`) plus muted warm semantics. Components must use the *aliases* (`--bg-app`, `--bg-surface`, `--bg-sunken`, `--text-strong/body/muted/faint`, `--border-subtle/strong/sunken`, `--action-primary-*`), never the raw ramp. **There is no brand hue — the accent is ink itself.** Anything reaching for a gold/blue "accent colour" is off-system.
- **Type** — `--font-display` (Bodoni Moda) is reserved for hero moments: the wordmark, the home name, page and post titles, big numerals, pull quotes. `--font-sans` (Space Grotesk) carries every functional surface. `--font-mono` (Space Mono) carries numbers — dates, counts, indexes. `--font-body` (Noto Serif SC) is the long-form reading face. The Latin faces have no CJK glyphs, so the display and sans stacks fall through to Noto Serif SC / the system UI face per-glyph; that fallthrough is deliberate, don't "fix" it.
- **Labels** — the `.eyebrow` class (uppercase Space Grotesk, `--tracking-caps`) is the system's label voice. `.section-rule` pairs a display numeral with an eyebrow and a hairline.
- **Radii** — sharp: 2px chips, 4px controls, 8px cards. Nothing is very round.
- **Elevation** — hairline border first, shadow second. Cards are flat by default; hover shifts border and background one warm step.
- Fonts are `<link>`-ed from `index.html`, **not** `@import`-ed from CSS (an `@import` is only discovered after the stylesheet parses, serialising the requests). Only the weights actually in use are requested — the CJK face is heavy, so adding a weight there has a real cost.
- The `.prose` class handles all markdown post typography. Shiki dual-theme highlighting (`vitesse-light` / `vitesse-dark`) resolves through `--shiki-light` / `--shiki-dark`; paper is the default and `[data-theme="dark"]` swaps it.

**Two needle rules are deliberately not followed**, because they lose to measured performance on this site:

1. needle specifies `backdrop-filter: blur(10px)` on sticky chrome. The navbar stays **opaque** — backdrop-filter re-blurs everything under the header on every scroll frame and was the biggest source of scroll stutter here.
2. needle specifies a 2px hover lift on interactive cards and a 0.5px press nudge on buttons. Hover `transform` is out; cards respond with border and background instead.

The rest of the motion budget stands: durations come from `--dur-fast/base/slow` with `--ease-standard`, and transitions apply only to `color`, `background`, `border-color` and `opacity` — never layout properties.

### Personalisation

- `src/config/site.ts` — name, bio, social links, RSS metadata. This is imported by `vite.config.ts` so it must remain valid TypeScript with a named `siteConfig` export.
- `src/data/projects.ts` — project list for the Projects page.
- `public/avatar.jpg` — profile photo.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml` which builds and deploys to GitHub Pages. Requires Pages source set to **GitHub Actions** in repo settings (one-time). `netlify.toml` is also present for Netlify deploy as an alternative.
