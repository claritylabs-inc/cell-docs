export const CURRENT_VERSION = process.env.CELL_VERSION ?? "0.0.0";

const BASE_URL =
  process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://cell.claritylabs.inc/docs";

export const versions = [
  {
    version: CURRENT_VERSION,
    label: `v${CURRENT_VERSION} (latest)`,
    url: `${BASE_URL}/v${CURRENT_VERSION}`,
  },
];
