import { createMDX } from "fumadocs-mdx/next";
import { readFileSync } from "fs";
import { resolve } from "path";

const withMDX = createMDX();

const cellPkgPath = resolve("node_modules/@claritylabs-inc/cell/package.json");
const cellVersion = JSON.parse(readFileSync(cellPkgPath, "utf-8")).version;

export default withMDX({
  reactStrictMode: true,
  env: {
    CELL_VERSION: cellVersion,
  },
});
