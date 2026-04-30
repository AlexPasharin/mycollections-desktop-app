import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import {
  assertInsideGitWorkTree,
  getChangedGitPathLines,
} from "./git-changed-paths.ts";

const require = createRequire(import.meta.url);

const extRe = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md|html|yml|yaml|mdx)$/i;

// TEMP: violates @stylistic/lines-around-comment (needs a blank line above). Delete after testing lint --fix.

const namedBasenames = new Set([".prettierrc", ".prettierignore"]);

function pickPrettierFiles(paths: string[]): string[] {
  const unique = [...new Set(paths)];

  return unique.filter((p) => {
    if (!existsSync(p)) {
      return false;
    }

    const base = p.split("/").pop() ?? p;

    return extRe.test(p) || namedBasenames.has(base);
  });
}

assertInsideGitWorkTree("prettify-changed");

const files = pickPrettierFiles(getChangedGitPathLines());

if (files.length === 0) {
  console.info(
    "prettify-changed: no changed or new Prettier-supported files (staged, unstaged, or untracked)",
  );
  process.exit(0);
}

// Same pattern as eslint: avoid package "exports" subpath issues
const prettierBin = join(
  dirname(require.resolve("prettier/package.json")),
  "bin",
  "prettier.cjs",
);

const r = spawnSync(
  process.execPath,
  [prettierBin, "--write", "--log-level=warn", ...files],
  {
    stdio: "inherit",
  },
);

process.exit(r.status ?? 1);
