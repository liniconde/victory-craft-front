import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";

const rootDir = resolve(new URL("..", import.meta.url).pathname);
const tempDir = join(rootDir, ".tmp-agent-tests");

await mkdir(tempDir, { recursive: true });

const testEntries = ["src/app/agent/api/agentPlannerClient.test.ts"];
const bundledTests = [];

for (const entry of testEntries) {
  const entryPath = resolve(rootDir, entry);
  const outfile = join(tempDir, entry.replaceAll("/", "_").replace(/\.ts$/, ".mjs"));

  await build({
    entryPoints: [entryPath],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    sourcemap: "inline",
    external: ["axios"],
  });

  bundledTests.push(outfile);
}

const result = spawnSync(process.execPath, ["--test", ...bundledTests], {
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
