export const CURRENT_VERSION = process.env.CL_SDK_VERSION ?? "0.0.0";

/** Major version number only, e.g. "0" from "0.2.5" */
export const MAJOR_VERSION = CURRENT_VERSION.split(".")[0];

const BASE_URL =
  process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? "https://cl-sdk.claritylabs.inc/docs";

export const versions = [
  {
    version: CURRENT_VERSION,
    label: `CL-${MAJOR_VERSION} (latest)`,
    url: `${BASE_URL}/v${CURRENT_VERSION}`,
  },
];
