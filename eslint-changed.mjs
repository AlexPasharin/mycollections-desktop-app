import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

const extRe = /\.(ts|tsx)$/i;

const fix = process.argv.includes("--fix");

function pickEslintFiles(raw) {
  const lines = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const unique = [...new Set(lines)];
  return unique.filter((p) => existsSync(p) && extRe.test(p));
}

let diff;

try {
  diff = execFileSync(
    "git",
    ["diff", "--name-only", "--diff-filter=ACM", "HEAD"],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
} catch {
  console.error("eslint-changed: git diff failed (not a git repo?)");
  process.exit(1);
}

const files = pickEslintFiles(diff);

if (files.length === 0) {
  console.info("eslint-changed: no changed .ts/.tsx files vs HEAD");
  process.exit(0);
}

const action = fix ? "linting (fix)" : "linting";
console.info(
  `eslint-changed: ${action} ${files.length} changed file(s) vs HEAD:\n${files.map((f) => `  ${f}`).join("\n")}`,
);

// eslint package.json "exports" does not expose ./bin/eslint.js to require.resolve
const eslintBin = join(
  dirname(require.resolve("eslint/package.json")),
  "bin",
  "eslint.js",
);
const args = [...(fix ? ["--fix"] : []), ...files];
const r = spawnSync(process.execPath, [eslintBin, ...args], {
  stdio: "inherit",
});

process.exit(r.status ?? 1);
