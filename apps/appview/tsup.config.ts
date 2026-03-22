import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  noExternal: ["common"],
  external: ["@atproto/api", "@atproto/common-web", "@atproto/identity"],
});
