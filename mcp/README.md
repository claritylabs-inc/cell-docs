# @claritylabs-inc/cl-sdk-mcp

MCP server for the CL-SDK. Exposes SDK functions and documentation search as [Model Context Protocol](https://modelcontextprotocol.io/) tools for AI coding assistants like Claude Code, Cursor, and Windsurf.

## Install

Published to GitHub Packages. Requires a `.npmrc` pointing `@claritylabs-inc` to `https://npm.pkg.github.com`.

```bash
npm install -g @claritylabs-inc/cl-sdk-mcp
```

## Setup

### Claude Code

Add to `.claude/mcp.json` (project or global `~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "cl-sdk": {
      "command": "npx",
      "args": ["@claritylabs-inc/cl-sdk-mcp"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings (`~/.cursor/mcp.json` or equivalent):

```json
{
  "mcpServers": {
    "cl-sdk": {
      "command": "npx",
      "args": ["@claritylabs-inc/cl-sdk-mcp"]
    }
  }
}
```

## Tools

### Documentation (no API key needed)

| Tool | Description |
|------|-------------|
| `search_docs` | Full-text search across SDK docs, returns top 5 matches |
| `read_doc_page` | Read a doc page by slug (e.g. `getting-started/quickstart`) |
| `list_doc_sections` | List all sections and pages |

### Prompt builders (no API key needed)

| Tool | Description |
|------|-------------|
| `build_agent_system_prompt` | Generate an insurance-aware agent system prompt |
| `build_field_extraction_prompt` | Application field extraction prompt |
| `build_auto_fill_prompt` | Auto-fill prompt for application fields |
| `build_question_batch_prompt` | Batched question prompt for unfilled fields |
| `apply_extracted` | Map raw policy extraction to structured fields |
| `apply_extracted_quote` | Map raw quote extraction to structured fields |

### Extraction (requires API key)

| Tool | Description |
|------|-------------|
| `classify_document` | Classify a PDF as policy or quote |
| `extract_policy` | Full multi-pass policy extraction from PDF |
| `extract_quote` | Full multi-pass quote extraction from PDF |

### PDF operations (no API key needed)

| Tool | Description |
|------|-------------|
| `get_acro_form_fields` | List fillable AcroForm fields in a PDF |
| `fill_acro_form` | Fill form fields and return flattened PDF |
| `overlay_text_on_pdf` | Overlay text at coordinates on a flat PDF |

## Configuration

Extraction tools need a model provider and API key. The simplest setup:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Defaults to Anthropic `claude-haiku-4-5-20251001`. Override with environment variables:

| Variable | Default |
|----------|---------|
| `CL_MCP_PROVIDER` | `anthropic` |
| `CL_MCP_MODEL` | `claude-haiku-4-5-20251001` |

Supports `anthropic`, `openai`, and `google` providers.

Alternatively, place an `mcp-config.json` next to the server:

```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "apiKey": "${ANTHROPIC_API_KEY}"
}
```

## Docs

Full documentation: [cl-sdk.claritylabs.inc/docs/mcp-server/overview](https://cl-sdk.claritylabs.inc/docs/mcp-server/overview)
