import { createMDX } from "fumadocs-mdx/next";
import { readFileSync } from "fs";
import { resolve } from "path";

const withMDX = createMDX();

const sdkPkgPath = resolve("node_modules/@claritylabs-inc/cl-sdk/package.json");
const sdkVersion = JSON.parse(readFileSync(sdkPkgPath, "utf-8")).version;

export default withMDX({
  reactStrictMode: true,
  env: {
    CL_SDK_VERSION: sdkVersion,
  },
});
