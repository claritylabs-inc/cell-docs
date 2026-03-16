import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import { parseArgs } from "util";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const { values } = parseArgs({
  options: {
    version: { type: "string" },
    "old-types": { type: "string" },
    major: { type: "boolean", default: false },
  },
});

const version = values.version;
const oldTypesPath = values["old-types"];
const isMajor = values.major ?? false;

if (!version || !oldTypesPath) {
  console.error(
    "Usage: npx tsx scripts/generate-docs.ts --version <ver> --old-types <path> [--major]"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT = join(ROOT, "content", "docs");
const NEW_TYPES_PATH = resolve(
  ROOT,
  "node_modules/@claritylabs-inc/cell/dist/index.d.ts"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFile(path: string): string {
  return readFileSync(path, "utf-8");
}

function readContentFile(relativePath: string): string {
  return readFile(join(CONTENT, relativePath));
}

function writeContentFile(relativePath: string, content: string): void {
  writeFileSync(join(CONTENT, relativePath), content, "utf-8");
}

async function callHaiku(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    prompt: userPrompt,
  });
  return text;
}

const SYSTEM_PROMPT = `You are a technical documentation writer for a TypeScript library called Cell.
You write MDX documentation using fumadocs conventions.

Rules:
- Use fumadocs components: <Callout>, <Cards>, <Card>, <Tabs>, <Tab>
- Import components from fumadocs-ui/components/* when needed
- Use fenced code blocks with language identifiers (\`\`\`typescript, \`\`\`bash)
- Do NOT use emojis
- Keep the existing document structure and tone
- Be precise and concise
- Only modify sections affected by the changes
- Preserve all existing content that is not affected by the changes`;

// ---------------------------------------------------------------------------
// 1. Diff analysis
// ---------------------------------------------------------------------------

console.log(`Generating docs for v${version} (major: ${isMajor})`);

const oldTypes = readFile(oldTypesPath);
const newTypes = existsSync(NEW_TYPES_PATH) ? readFile(NEW_TYPES_PATH) : "";

if (!newTypes) {
  console.error(`Could not read new types at ${NEW_TYPES_PATH}`);
  process.exit(1);
}

const diffPrompt = `Compare these two TypeScript declaration files and list the changes:

OLD (previous version):
\`\`\`typescript
${oldTypes}
\`\`\`

NEW (v${version}):
\`\`\`typescript
${newTypes}
\`\`\`

List each change as:
- ADDED: <export name> — <brief description>
- REMOVED: <export name> — <brief description>
- CHANGED: <export name> — <what changed>

If there are no changes, say "No changes detected."`;

console.log("Analyzing type diffs...");
const diffAnalysis = await callHaiku(
  "You analyze TypeScript declaration file diffs. Be precise and thorough.",
  diffPrompt
);
console.log("Diff analysis:\n", diffAnalysis);

// ---------------------------------------------------------------------------
// 2. Changelog generation (all releases)
// ---------------------------------------------------------------------------

console.log("Generating changelog entry...");

const changelogPath = "changelog.mdx";
const existingChangelog = existsSync(join(CONTENT, changelogPath))
  ? readContentFile(changelogPath)
  : `---
title: Changelog
description: Release history for @claritylabs-inc/cell
---

All notable changes to \`@claritylabs-inc/cell\` will be documented here. This page is automatically updated when new versions are published.
`;

const today = new Date().toISOString().split("T")[0];
const changelogPrompt = `Generate a changelog entry for v${version} (released ${today}).

Changes detected:
${diffAnalysis}

The entry should follow this format:
## v${version} — ${today}

<brief summary paragraph>

### Added
- ...

### Changed
- ...

### Removed
- ...

Only include sections (Added/Changed/Removed) that have entries.
Do NOT include the frontmatter or any top-level "# Changelog" heading — just the version entry starting with ##.`;

const changelogEntry = await callHaiku(SYSTEM_PROMPT, changelogPrompt);

// Append changelog entry after the intro paragraph (after the first blank line following frontmatter content)
const frontmatterEnd = existingChangelog.indexOf("---", 3) + 3;
const bodyContent = existingChangelog.slice(frontmatterEnd);
// Find the end of the intro paragraph (first double newline in body)
const introEnd = bodyContent.indexOf("\n\n");
const insertPoint =
  introEnd !== -1
    ? frontmatterEnd + introEnd + 2
    : existingChangelog.length;
const updatedChangelog =
  existingChangelog.slice(0, insertPoint) +
  "\n" +
  changelogEntry.trim() +
  "\n" +
  existingChangelog.slice(insertPoint);

writeContentFile(changelogPath, updatedChangelog);
console.log("Changelog updated.");

// ---------------------------------------------------------------------------
// 3. API reference regeneration (major only)
// ---------------------------------------------------------------------------

if (isMajor) {
  const apiRefPages = [
    "api-reference/extraction.mdx",
    "api-reference/agent.mdx",
    "api-reference/application.mdx",
    "api-reference/pdf.mdx",
    "api-reference/types.mdx",
  ];

  for (const page of apiRefPages) {
    const fullPath = join(CONTENT, page);
    if (!existsSync(fullPath)) {
      console.log(`Skipping ${page} (not found)`);
      continue;
    }

    console.log(`Updating API reference: ${page}...`);
    const currentMdx = readContentFile(page);

    const apiPrompt = `Update this API reference page to reflect the new type definitions for v${version}.

Current MDX page:
\`\`\`mdx
${currentMdx}
\`\`\`

New type definitions:
\`\`\`typescript
${newTypes}
\`\`\`

Changes from previous version:
${diffAnalysis}

Rules:
- Preserve the existing format, frontmatter, and fumadocs components
- Update type signatures, parameter lists, and return types to match the new definitions
- Add documentation for any new exports relevant to this page
- Remove documentation for any removed exports
- Keep all existing prose that is still accurate
- Output the COMPLETE updated MDX file (including frontmatter)`;

    const updatedPage = await callHaiku(SYSTEM_PROMPT, apiPrompt);
    writeContentFile(page, updatedPage);
    console.log(`Updated: ${page}`);
  }

  // ---------------------------------------------------------------------------
  // 4. Guide updates (major only)
  // ---------------------------------------------------------------------------

  const guidePages = [
    "getting-started/quickstart.mdx",
    "getting-started/architecture.mdx",
    "getting-started/models.mdx",
    "extraction/pipeline.mdx",
    "extraction/classification.mdx",
    "extraction/applying-results.mdx",
    "agent/system-prompt.mdx",
    "agent/platforms.mdx",
    "agent/tools.mdx",
    "application/overview.mdx",
    "application/pdf-operations.mdx",
  ];

  for (const page of guidePages) {
    const fullPath = join(CONTENT, page);
    if (!existsSync(fullPath)) {
      console.log(`Skipping guide ${page} (not found)`);
      continue;
    }

    console.log(`Updating guide: ${page}...`);
    const currentMdx = readContentFile(page);

    const guidePrompt = `Update this guide page to reflect API changes in v${version}.

Current MDX page:
\`\`\`mdx
${currentMdx}
\`\`\`

Changes from previous version:
${diffAnalysis}

Rules:
- Only modify sections that are affected by the API changes
- Preserve the existing tone, structure, frontmatter, and fumadocs components
- Update code examples to use new API signatures if they changed
- Keep all existing prose that is still accurate
- Output the COMPLETE updated MDX file (including frontmatter)`;

    const updatedGuide = await callHaiku(SYSTEM_PROMPT, guidePrompt);
    writeContentFile(page, updatedGuide);
    console.log(`Updated: ${page}`);
  }
}

console.log(`\nDoc generation complete for v${version}.`);
