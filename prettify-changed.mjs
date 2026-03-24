import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const extRe =
  /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|html|yml|yaml|mdx)$/i;

const namedBasenames = new Set([".prettierrc", ".prettierignore"]);

function pickPrettierFiles(raw) {
  const lines = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const unique = [...new Set(lines)];
  return unique.filter((p) => {
    if (!existsSync(p)) {
      return false;
    }

    const base = p.split("/").pop() ?? p;

    return extRe.test(p) || namedBasenames.has(base);
  });
}

let diff;

try {
  diff = execFileSync(
    "git",
    ["diff", "--name-only", "--diff-filter=ACM", "HEAD"],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
} catch {
  console.error("prettify-changed: git diff failed (not a git repo?)");
  process.exit(1);
}

const files = pickPrettierFiles(diff);

if (files.length === 0) {
  console.info("prettify-changed: no changed Prettier-supported files vs HEAD");
  process.exit(0);
}

const prettierBin = require.resolve("prettier/bin/prettier.cjs");
const r = spawnSync(process.execPath, [prettierBin, "--write", ...files], {
  stdio: "inherit",
});

process.exit(r.status ?? 1);
