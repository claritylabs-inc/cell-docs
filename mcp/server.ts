#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { PDFDocument } from "pdf-lib";
import type { LanguageModel } from "ai";

// SDK imports
import {
  buildAgentSystemPrompt,
  buildFieldExtractionPrompt,
  buildAutoFillPrompt,
  buildQuestionBatchPrompt,
  applyExtracted,
  applyExtractedQuote,
  classifyDocumentType,
  extractFromPdf,
  extractQuoteFromPdf,
  getAcroFormFields,
  fillAcroForm,
  overlayTextOnPdf,
  createUniformModelConfig,
} from "@claritylabs-inc/cl-sdk";

// ---------------------------------------------------------------------------
// Docs bundle
// ---------------------------------------------------------------------------

interface DocPage {
  slug: string;
  title: string;
  description: string;
  content: string;
}

interface DocSection {
  title: string;
  slug: string;
  pages: string[];
}

interface DocsBundle {
  sections: DocSection[];
  pages: DocPage[];
}

function loadDocsBundle(): DocsBundle {
  const bundlePath = path.resolve(__dirname, "docs-bundle.json");
  if (!fs.existsSync(bundlePath)) {
    console.error(
      "Warning: docs-bundle.json not found. Run `npx tsx mcp/build-docs.ts` to generate it.\n" +
      "Doc search/read tools will return empty results."
    );
    return { sections: [], pages: [] };
  }
  return JSON.parse(fs.readFileSync(bundlePath, "utf-8")) as DocsBundle;
}

const docs = loadDocsBundle();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface McpConfig {
  provider: string;
  model: string;
  apiKey: string;
}

function loadConfig(): McpConfig {
  // Check for config file next to server
  const configPath = path.resolve(__dirname, "mcp-config.json");
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const cfg = JSON.parse(raw) as McpConfig;
    cfg.apiKey = cfg.apiKey.replace(/\$\{(\w+)\}/g, (_, name) => process.env[name] ?? "");
    return cfg;
  } catch {
    // Fall back to env vars
    return {
      provider: process.env.CL_MCP_PROVIDER ?? "anthropic",
      model: process.env.CL_MCP_MODEL ?? "claude-haiku-4-5-20251001",
      apiKey: process.env.ANTHROPIC_API_KEY ?? process.env.OPENAI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
    };
  }
}

async function createModel(cfg: McpConfig): Promise<LanguageModel> {
  switch (cfg.provider) {
    case "anthropic": {
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      const provider = createAnthropic({ apiKey: cfg.apiKey });
      return provider(cfg.model);
    }
    case "openai": {
      const { createOpenAI } = await import("@ai-sdk/openai");
      const provider = createOpenAI({ apiKey: cfg.apiKey });
      return provider(cfg.model);
    }
    case "google": {
      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      const provider = createGoogleGenerativeAI({ apiKey: cfg.apiKey });
      return provider(cfg.model);
    }
    default:
      throw new Error(`Unsupported provider: ${cfg.provider}`);
  }
}

// ---------------------------------------------------------------------------
// Doc search helpers
// ---------------------------------------------------------------------------

function searchDocs(
  query: string,
  section?: string
): { slug: string; title: string; excerpt: string; score: number }[] {
  const q = query.toLowerCase();
  const wordBoundary = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

  const results: { slug: string; title: string; excerpt: string; score: number }[] = [];

  for (const page of docs.pages) {
    if (section && !page.slug.startsWith(section + "/") && page.slug !== section) continue;

    const lower = page.content.toLowerCase();
    if (!lower.includes(q)) continue;

    let score = 0;
    let idx = 0;
    while ((idx = lower.indexOf(q, idx)) !== -1) {
      score++;
      idx += q.length;
    }
    const wbMatches = page.content.match(wordBoundary);
    if (wbMatches) score += wbMatches.length * 2;
    if (page.title.toLowerCase().includes(q)) score += 10;

    const firstIdx = lower.indexOf(q);
    const start = Math.max(0, firstIdx - 100);
    const end = Math.min(page.content.length, firstIdx + q.length + 100);
    const excerpt =
      (start > 0 ? "..." : "") +
      page.content.slice(start, end).trim() +
      (end < page.content.length ? "..." : "");

    results.push({ slug: page.slug, title: page.title, excerpt, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "cl-sdk-docs",
  version: "1.0.0",
});

// --- Documentation tools ---

server.tool(
  "list_doc_sections",
  "List all documentation sections and their pages",
  {},
  async () => {
    return {
      content: [{ type: "text", text: JSON.stringify(docs.sections, null, 2) }],
    };
  }
);

server.tool(
  "search_docs",
  "Full-text search across SDK documentation pages. Returns top 5 matches with context.",
  {
    query: z.string().describe("Search query"),
    section: z.string().optional().describe("Limit to section slug (e.g. 'extraction', 'agent')"),
  },
  async ({ query, section }) => {
    const results = searchDocs(query, section);
    if (results.length === 0) {
      return { content: [{ type: "text", text: "No results found." }] };
    }
    const text = results
      .map((r, i) => `### ${i + 1}. ${r.title} (${r.slug})\nScore: ${r.score}\n\n${r.excerpt}`)
      .join("\n\n---\n\n");
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "read_doc_page",
  "Read a specific documentation page by slug (e.g. 'getting-started/quickstart')",
  {
    slug: z.string().describe("Page slug relative to docs root"),
  },
  async ({ slug }) => {
    const page = docs.pages.find((p) => p.slug === slug);
    if (!page) {
      return {
        content: [{ type: "text", text: `Page not found: ${slug}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `# ${page.title}\n\n${page.content}` }],
    };
  }
);

// --- SDK pure function tools ---

server.tool(
  "build_agent_system_prompt",
  "Generate an insurance-aware agent system prompt from an AgentContext",
  {
    platform: z.enum(["email", "chat", "sms", "slack", "discord"]).describe("Communication platform"),
    intent: z.enum(["direct", "mediated", "observed"]).describe("Communication intent"),
    siteUrl: z.string().describe("Company website URL"),
    companyName: z.string().optional(),
    companyContext: z.string().optional(),
    userName: z.string().optional(),
    coiHandling: z.enum(["broker", "user", "member", "ignore"]).optional(),
    brokerName: z.string().optional(),
    brokerContactName: z.string().optional(),
    brokerContactEmail: z.string().optional(),
  },
  async (args) => {
    const prompt = buildAgentSystemPrompt(args);
    return { content: [{ type: "text", text: prompt }] };
  }
);

server.tool(
  "build_field_extraction_prompt",
  "Get the application field extraction prompt",
  {},
  async () => {
    const prompt = buildFieldExtractionPrompt();
    return { content: [{ type: "text", text: prompt }] };
  }
);

server.tool(
  "build_auto_fill_prompt",
  "Generate an auto-fill prompt for application fields given fields and org context",
  {
    fields: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          fieldType: z.string(),
          section: z.string(),
        })
      )
      .describe("Application fields to auto-fill"),
    orgContext: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          category: z.string(),
        })
      )
      .describe("Organization context key-value pairs"),
  },
  async ({ fields, orgContext }) => {
    const prompt = buildAutoFillPrompt(fields, orgContext);
    return { content: [{ type: "text", text: prompt }] };
  }
);

server.tool(
  "build_question_batch_prompt",
  "Generate a batched question prompt for unfilled application fields",
  {
    unfilledFields: z
      .array(
        z.object({
          id: z.string(),
          label: z.string().optional(),
          text: z.string().optional(),
          fieldType: z.string(),
          section: z.string(),
          required: z.boolean(),
          condition: z
            .object({ dependsOn: z.string(), whenValue: z.string() })
            .optional(),
        })
      )
      .describe("Unfilled fields that need questions generated"),
  },
  async ({ unfilledFields }) => {
    const prompt = buildQuestionBatchPrompt(unfilledFields);
    return { content: [{ type: "text", text: prompt }] };
  }
);

server.tool(
  "apply_extracted",
  "Map raw policy extraction JSON to structured fields",
  {
    extracted: z.any().describe("Raw extraction JSON from extractFromPdf"),
  },
  async ({ extracted }) => {
    const result = applyExtracted(extracted);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "apply_extracted_quote",
  "Map raw quote extraction JSON to structured fields",
  {
    extracted: z.any().describe("Raw extraction JSON from extractQuoteFromPdf"),
  },
  async ({ extracted }) => {
    const result = applyExtractedQuote(extracted);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// --- SDK LLM tools ---

let _model: LanguageModel | null = null;
async function getModel(): Promise<LanguageModel> {
  if (!_model) {
    const cfg = loadConfig();
    _model = await createModel(cfg);
  }
  return _model;
}

server.tool(
  "classify_document",
  "Classify a PDF document as policy or quote. Requires a configured model and API key.",
  {
    pdfBase64: z.string().describe("Base64-encoded PDF document"),
  },
  async ({ pdfBase64 }) => {
    const model = await getModel();
    const models = createUniformModelConfig(model);
    const result = await classifyDocumentType(pdfBase64, { models });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "extract_policy",
  "Full multi-pass policy extraction from a PDF. Requires a configured model and API key.",
  {
    pdfBase64: z.string().describe("Base64-encoded PDF document"),
  },
  async ({ pdfBase64 }) => {
    const model = await getModel();
    const models = createUniformModelConfig(model);
    const result = await extractFromPdf(pdfBase64, { models });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "extract_quote",
  "Full multi-pass quote extraction from a PDF. Requires a configured model and API key.",
  {
    pdfBase64: z.string().describe("Base64-encoded PDF document"),
  },
  async ({ pdfBase64 }) => {
    const model = await getModel();
    const models = createUniformModelConfig(model);
    const result = await extractQuoteFromPdf(pdfBase64, { models });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// --- SDK PDF tools ---

server.tool(
  "get_acro_form_fields",
  "List all fillable AcroForm fields in a PDF",
  {
    pdfBase64: z.string().describe("Base64-encoded PDF document"),
  },
  async ({ pdfBase64 }) => {
    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const pdfDoc = await PDFDocument.load(bytes);
    const fields = getAcroFormFields(pdfDoc);
    return { content: [{ type: "text", text: JSON.stringify(fields, null, 2) }] };
  }
);

server.tool(
  "fill_acro_form",
  "Fill AcroForm fields in a PDF and return the flattened result as base64",
  {
    pdfBase64: z.string().describe("Base64-encoded PDF document"),
    mappings: z
      .array(
        z.object({
          acroFormName: z.string().describe("Form field name"),
          value: z.string().describe("Value to fill"),
        })
      )
      .describe("Field name to value mappings"),
  },
  async ({ pdfBase64, mappings }) => {
    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const result = await fillAcroForm(bytes, mappings);
    const b64 = Buffer.from(result).toString("base64");
    return { content: [{ type: "text", text: b64 }] };
  }
);

server.tool(
  "overlay_text_on_pdf",
  "Overlay text on a flat PDF at specified coordinates. Returns base64 PDF.",
  {
    pdfBase64: z.string().describe("Base64-encoded PDF document"),
    overlays: z
      .array(
        z.object({
          page: z.number().describe("Page number (0-indexed)"),
          x: z.number().describe("X coordinate"),
          y: z.number().describe("Y coordinate"),
          text: z.string().describe("Text to overlay"),
          fontSize: z.number().optional().describe("Font size (default 12)"),
          isCheckmark: z.boolean().optional().describe("Render as checkmark"),
        })
      )
      .describe("Text overlay specifications"),
  },
  async ({ pdfBase64, overlays }) => {
    const bytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    const result = await overlayTextOnPdf(bytes, overlays);
    const b64 = Buffer.from(result).toString("base64");
    return { content: [{ type: "text", text: b64 }] };
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CL-SDK MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
