import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

/** UTF-8 snapshot for diffing after `eslint --fix`. */
function snapshotFileContents(paths: string[]): Map<string, string> {
  const snap = new Map<string, string>();

  for (const p of paths) {
    try {
      snap.set(p, readFileSync(p, "utf8"));
    } catch {
      snap.set(p, "");
    }
  }

  return snap;
}

function listPathsWithChangedContents(
  before: Map<string, string>,
  paths: string[],
): string[] {
  const changed: string[] = [];

  for (const p of paths) {
    let after: string;

    try {
      after = readFileSync(p, "utf8");
    } catch {
      continue;
    }

    if (after !== before.get(p)) {
      changed.push(p);
    }
  }

  return changed;
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
const contentsBeforeFix = fix ? snapshotFileContents(files) : null;

const r = spawnSync(process.execPath, [eslintBin, ...args], {
  stdio: "inherit",
});

if (fix && contentsBeforeFix) {
  const fixedFiles = listPathsWithChangedContents(contentsBeforeFix, files);

  if (fixedFiles.length > 0) {
    console.info();
    console.info(
      `eslint-changed: --fix modified ${fixedFiles.length} file(s):\n${fixedFiles.map((f) => `  ${f}`).join("\n")}`,
    );
  }
}

process.exit(r.status ?? 1);
