# Contributing

## Local setup

```bash
git clone https://github.com/clarity-labs/cell-docs.git
cd cell-docs
npm install
npm run dev
```

## Making changes

1. Create a branch from `main`
2. Edit MDX files in `content/docs/`
3. Preview locally with `npm run dev`
4. Run `npm run build` to verify the build passes
5. Submit a pull request

## Adding pages

1. Create an MDX file in the appropriate `content/docs/` subdirectory
2. Add frontmatter with `title` and `description`
3. Add the filename (without `.mdx`) to that directory's `meta.json` `pages` array

Example frontmatter:

```yaml
---
title: Page Title
description: Brief description of the page content
---
```

## Writing guidelines

- Use active voice and address the reader as "you"
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Include code examples wherever possible
- Use `<Callout type="info">` for important notes and `<Callout type="warn">` for warnings

## Available components

Import from `fumadocs-ui/components/*`:

- `<Callout type="info|warn|error">` — Highlighted notes
- `<Cards>` + `<Card>` — Link cards for navigation
- `<Tabs items={[]}>` + `<Tab value="">` — Tabbed content
- `<Steps>` + `<Step>` — Numbered steps
