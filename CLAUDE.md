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
- `usePosts()` — uses an **eager** `import.meta.glob` to build the sorted post list (frontmatter only, no content rendered).
- `postModules` — a **lazy** `import.meta.glob` used by `PostPage.vue` to dynamically load post content on navigation.

**Photos** drop zone is `photos/` (root). Raw files (no `p-` prefix) are gitignored. The `npm run photos` script (`scripts/photos-manage.ts`) processes them: reads EXIF capture date → strips all metadata → compresses → renames to `p-{iso-date}-{index}.{ext}` → outputs to `public/photos/` → generates blurhash sidecar `.json` files → writes `src/data/photos.json` manifest. The pre-commit hook (`.husky/pre-commit`) auto-runs this when committing.

**RSS** is generated as a Vite `closeBundle` plugin (in `vite.config.ts`) so `public/rss.xml` is always fresh after every build. The `generateRss` function in `scripts/generate-rss.ts` receives `siteConfig` as a parameter from `vite.config.ts` — do not make it re-import site config dynamically.

### State & routing

- Theme (dark/light, default dark) is in a Pinia store (`src/stores/theme.ts`), persisted to `localStorage`, applied as `data-theme` attribute on `<html>`.
- Router uses `createWebHashHistory` (hash URLs) so GitHub Pages needs no server config.

### Styling

All design tokens are CSS custom properties in `src/styles/main.css`. Both themes (`[data-theme="light"]`) are defined there. The `.prose` class handles all markdown post typography. Shiki dual-theme syntax highlighting uses `--shiki-dark` / `--shiki-light` CSS variables.

Font stack: `--font-ui` (IBM Plex Mono) for all UI chrome, `--font-body` (Noto Serif SC) for post content, `--font-code` (JetBrains Mono) for code blocks.

### Personalisation

- `src/config/site.ts` — name, bio, social links, RSS metadata. This is imported by `vite.config.ts` so it must remain valid TypeScript with a named `siteConfig` export.
- `src/data/projects.ts` — project list for the Projects page.
- `public/avatar.jpg` — profile photo.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml` which builds and deploys to GitHub Pages. Requires Pages source set to **GitHub Actions** in repo settings (one-time). `netlify.toml` is also present for Netlify deploy as an alternative.
