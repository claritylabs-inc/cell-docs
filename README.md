# CL-SDK Documentation

Documentation site for [`@claritylabs-inc/cl-sdk`](https://github.com/claritylabs-inc/cl-sdk) — the shared intelligence layer for AI working with insurance.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to preview.

## Build

```bash
npm run build
npm run start
```

## Stack

- [Next.js 16](https://nextjs.org) — App Router with Turbopack
- [Fumadocs](https://fumadocs.vercel.app) — Documentation framework
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [MDX](https://mdxjs.com) — Content authoring

## Content

Documentation pages live in `content/docs/` as MDX files. Navigation is configured through `meta.json` files in each directory.

To add a new page:

1. Create an MDX file in the appropriate `content/docs/` subdirectory
2. Add the filename (without extension) to that directory's `meta.json` `pages` array
3. The page will appear in the sidebar automatically

## Project structure

```
app/
  layout.tsx          Root layout (fonts, providers)
  global.css          Theme and style overrides
  docs/
    layout.tsx        Docs layout (logo, nav, sidebar)
    [[...slug]]/
      page.tsx        Page renderer
content/
  docs/               MDX documentation pages
    meta.json         Root navigation
    getting-started/  Install, architecture, models
    extraction/       Pipeline, classification, results
    agent/            Prompts, platforms, tools
    application/      Overview, PDF operations
    api-reference/    Full API reference
lib/
  source.ts           Fumadocs content loader
source.config.ts      MDX collection config
next.config.ts        Next.js + MDX config
```
