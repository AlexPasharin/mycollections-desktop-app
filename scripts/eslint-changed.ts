import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import {
  assertInsideGitWorkTree,
  getChangedGitPathLines,
} from "./git-changed-paths.ts";

const require = createRequire(import.meta.url);

const extRe = /\.(ts|tsx)$/i;

const fix = process.argv.includes("--fix");

function pickEslintFiles(paths: string[]): string[] {
  const unique = [...new Set(paths)];

  return unique.filter((p) => existsSync(p) && extRe.test(p));
}

assertInsideGitWorkTree("eslint-changed");

const files = pickEslintFiles(getChangedGitPathLines());

if (files.length === 0) {
  console.info(
    "eslint-changed: no changed or new .ts/.tsx files (staged, unstaged, or untracked)",
  );
  process.exit(0);
}

const action = fix ? "linting (fix)" : "linting";
console.info(
  `eslint-changed: ${action} ${files.length} file(s) (staged / unstaged / untracked):\n${files.map((f) => `  ${f}`).join("\n")}`,
);

// eslint package.json "exports" does not expose ./bin/eslint.js to require.resolve
const eslintBin = join(
  dirname(require.resolve("eslint/package.json")),
  "bin",
  "eslint.js",
);
const args: string[] = fix ? ["--fix", ...files] : files;
const r = spawnSync(process.execPath, [eslintBin, ...args], {
  stdio: "inherit",
});

process.exit(r.status ?? 1);
