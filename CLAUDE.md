# Cell Documentation Site

## Project overview

Documentation site for `@claritylabs-inc/cell` — the shared intelligence layer for AI working with insurance. Built with Next.js 16, fumadocs v16, and Tailwind CSS v4.

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Docs engine**: fumadocs-core + fumadocs-ui + fumadocs-mdx v16/v14
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`, custom Clarity Labs theme in `app/global.css`
- **Fonts**: Geist Sans + Geist Mono via `geist` package
- **Content**: MDX files in `content/docs/`, navigation via `meta.json` files

## Key files

- `app/global.css` — Full theme overrides (colors, typography, code blocks, sidebar, search dialog, cards)
- `app/docs/layout.tsx` — Docs layout with Clarity Labs globe logo and nav config
- `app/docs/[[...slug]]/page.tsx` — Page renderer using DocsPage/DocsBody
- `lib/source.ts` — Fumadocs loader (imports from `@/.source/server`)
- `lib/versions.ts` — Version config (current version + all version URLs)
- `components/version-select.tsx` — Sidebar version dropdown component
- `source.config.ts` — MDX collection definition
- `components/ui/dropdown-menu.tsx` — shadcn dropdown menu (base-ui)
- `next.config.ts` — Next.js config wrapped with `createMDX()`, injects `CELL_VERSION` env var
- `content/docs/` — All MDX documentation pages
- `content/docs/meta.json` — Root sidebar navigation (uses `"root": true`)
- `content/docs/*/meta.json` — Section navigation with `title` and `pages` array

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server

## Content structure

```
content/docs/
  index.mdx                    — Landing page
  getting-started/             — Quickstart, architecture, model config
  extraction/                  — Pipeline, classification, applying results
  agent/                       — System prompt, platforms, tools
  application/                 — Overview, PDF operations
  api-reference/               — Extraction, agent, application, PDF, types
```

## Conventions

- Use fumadocs components: `<Callout>`, `<Cards>`, `<Card>`, `<Tabs>`, `<Tab>`
- Import components from `fumadocs-ui/components/*`
- Code blocks use fenced markdown with language identifiers (```typescript, ```bash)
- Navigation is controlled by `meta.json` files, not frontmatter
- Sidebar section titles come from each folder's `meta.json` `title` field
- Do NOT use separator entries (`---Title---`) in meta.json — they cause duplication
- The root `meta.json` uses `"root": true` to avoid showing a "Documentation" wrapper

## Design system

Colors match the Clarity Labs design language from email-experiment:
- Background: `#faf8f4` (warm off-white)
- Foreground: `#111827`
- Primary: `#2a97ff` (blue)
- Muted: `#f3f1ed`
- Border: `rgba(17, 24, 39, 0.06)`
- Cards: frosted glass `rgba(255, 255, 255, 0.6)`

## Versioning

Each docs version lives on a separate git branch. The version is auto-read from `@claritylabs-inc/cell` package at build time via `next.config.ts`.

- **Version source**: `@claritylabs-inc/cell` package.json → `CELL_VERSION` env var → `lib/versions.ts`
- **Config**: `lib/versions.ts` defines `CURRENT_VERSION` and the `versions` array
- **Dropdown**: `components/version-select.tsx` renders in the sidebar banner (shadcn dropdown via `@base-ui/react`)
- **URL env var**: `NEXT_PUBLIC_DOCS_BASE_URL` (defaults to `https://cell.claritylabs.inc/docs`, links become `{base}/v0.2` etc.)

**To release a new version:**
1. Create a branch from main: `git checkout -b v0.X`
2. On `main`, update `lib/versions.ts`: add the old version to the array
3. On the version branch, pin the `@claritylabs-inc/cell` dependency to the correct version
4. Deploy each branch to its respective URL with the appropriate env vars

## Auto-versioning & AI doc generation

When a new `@claritylabs-inc/cell` version is published, a GitHub Actions workflow automatically:
1. Updates the cell dependency on main
2. Creates/updates the version branch (e.g. `v0.3`)
3. Runs `scripts/generate-docs.ts` which uses Claude Haiku (via Vercel AI SDK) to:
   - Diff old vs new `.d.ts` exports
   - Generate a changelog entry (all releases)
   - Regenerate API reference + update guide pages (major releases only)
4. Syncs `lib/versions.ts` and `vercel.json` across branches
5. Pushes — Vercel auto-deploys

### Key files

- `scripts/generate-docs.ts` — AI doc generation script (uses `ai` + `@ai-sdk/anthropic`)
- `.github/workflows/version-update.yml` — CI workflow triggered by `repository_dispatch` or manual `workflow_dispatch`
- `vercel.json` — Path-based rewrites for version branches
- `content/docs/changelog.mdx` — Auto-generated changelog page

### Running locally

```bash
npx tsx scripts/generate-docs.ts --version 0.2.2 --old-types /tmp/old.d.ts [--major]
```

Requires `ANTHROPIC_API_KEY` in `.env.local`.

### Required secrets

| Secret | Repo | Purpose |
|--------|------|---------|
| `DOCS_REPO_PAT` | cell repo | PAT to trigger `repository_dispatch` on docs repo |
| `GH_PACKAGES_TOKEN` | docs repo | PAT with `read:packages` for private cell package |
| `ANTHROPIC_API_KEY` | docs repo | Anthropic API key for Claude Haiku doc generation |

### Cell repo dispatch

The cell repo needs a workflow (`.github/workflows/notify-docs.yml`) that sends a `repository_dispatch` to this repo on publish:
```yaml
- uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.DOCS_REPO_PAT }}
    repository: claritylabs-inc/docs
    event-type: cell-version-published
    client-payload: '{"version": "<version>"}'
```

## Troubleshooting

- **500 errors in dev**: Delete `.next` directory and restart — `rm -rf .next && npm run dev`
- **Stale .source files**: Run `npx fumadocs-mdx` to regenerate
- **fumadocs v16 imports**: Provider is at `fumadocs-ui/provider/next`, source at `@/.source/server`
