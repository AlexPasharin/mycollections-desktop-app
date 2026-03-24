import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import {
  assertInsideGitWorkTree,
  getChangedGitPathLines,
} from "./git-changed-paths.ts";

const require = createRequire(import.meta.url);

function pickTypeScriptRoots(relativePaths: string[], cwd: string): string[] {
  const unique = [...new Set(relativePaths)];

  return unique
    .filter((p) => existsSync(resolve(cwd, p)))
    .filter(
      (p) =>
        /\.(ts|tsx)$/i.test(p) && !p.endsWith(".d.ts") && !p.endsWith(".d.tsx"),
    )
    .map((p) => resolve(cwd, p));
}

assertInsideGitWorkTree("typecheck-changed");

const cwd = process.cwd();
const roots = pickTypeScriptRoots(getChangedGitPathLines(), cwd);

if (roots.length === 0) {
  console.info(
    "typecheck-changed: no changed or new .ts/.tsx sources (excluding .d.ts)",
  );
  process.exit(0);
}

console.info(
  `typecheck-changed: checking ${roots.length} file(s) (staged / unstaged / untracked):\n${roots.map((f) => `  ${f}`).join("\n")}`,
);

const baseConfig = resolve(cwd, "tsconfig.json");
const tmpDir = mkdtempSync(join(tmpdir(), "typecheck-changed-"));
const fragmentPath = join(tmpDir, "tsconfig.json");

writeFileSync(
  fragmentPath,
  `${JSON.stringify(
    {
      extends: baseConfig,
      files: roots,
    },
    null,
    2,
  )}\n`,
);

const tscBin = join(
  dirname(require.resolve("typescript/package.json")),
  "bin",
  "tsc",
);

let exitCode = 0;

try {
  execFileSync(tscBin, ["-p", fragmentPath], {
    stdio: "inherit",
    cwd,
  });
} catch (error: unknown) {
  exitCode =
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 1;
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}

process.exit(exitCode);
