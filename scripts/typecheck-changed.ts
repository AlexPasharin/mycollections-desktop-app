import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";

import {
  assertInsideGitWorkTree,
  getChangedGitPathLines,
} from "./git-changed-paths.ts";

const require = createRequire(import.meta.url);

const appAmbientTypeFiles = (cwd: string): string[] => [
  resolve(cwd, "src/assets/svg.d.ts"),
];

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

function partitionScriptVsAppRoots(
  roots: string[],
  cwd: string,
): { scriptRoots: string[]; appRoots: string[] } {
  const scriptsDir = resolve(cwd, "scripts");
  const prefix = scriptsDir + sep;

  const scriptRoots: string[] = [];
  const appRoots: string[] = [];

  for (const r of roots) {
    if (r === scriptsDir || r.startsWith(prefix)) {
      scriptRoots.push(r);
    } else {
      appRoots.push(r);
    }
  }

  return { scriptRoots, appRoots };
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

const { scriptRoots, appRoots } = partitionScriptVsAppRoots(roots, cwd);

const tscBin = join(
  dirname(require.resolve("typescript/package.json")),
  "bin",
  "tsc",
);

function runTsc(args: string[]): number {
  try {
    execFileSync(tscBin, args, {
      stdio: "inherit",
      cwd,
    });

    return 0;
  } catch (error: unknown) {
    return error !== null &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
      ? error.status
      : 1;
  }
}

let exitCode = 0;

if (scriptRoots.length > 0) {
  console.info(
    "\ntypecheck-changed: scripts/ (tsconfig: scripts/tsconfig.json)\n",
  );
  exitCode = runTsc(["-p", join(cwd, "scripts", "tsconfig.json")]);

  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

if (appRoots.length > 0) {
  console.info(
    "\ntypecheck-changed: app roots (fragment extending ./tsconfig.json)\n",
  );

  const baseConfig = resolve(cwd, "tsconfig.json");
  const tmpDir = mkdtempSync(join(tmpdir(), "typecheck-changed-"));
  const fragmentPath = join(tmpDir, "tsconfig.json");

  writeFileSync(
    fragmentPath,
    `${JSON.stringify(
      {
        extends: baseConfig,
        files: [
          ...appRoots,
          ...appAmbientTypeFiles(cwd).filter((file) => existsSync(file)),
        ],
      },
      null,
      2,
    )}\n`,
  );

  try {
    exitCode = runTsc(["-p", fragmentPath]);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

process.exit(exitCode);
