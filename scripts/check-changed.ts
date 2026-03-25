import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function runStep(
  label: string,
  scriptName: string,
  scriptArgs: string[] = [],
): void {
  console.info(`check-changed: ${label}`);
  const scriptPath = join(repoRoot, "scripts", scriptName);
  const r = spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

console.info(
  "check-changed: eslint (fix) → typecheck → prettify (changed files only)",
);
console.info();

// Same as lint-changed-fix: ESLint applies safe fixes, then exits non-zero only if
// problems remain (unfixable violations, or max-warnings, etc.).
runStep("1/3 eslint-changed --fix", "eslint-changed.ts", ["--fix"]);
console.info();

runStep("2/3 typecheck-changed", "typecheck-changed.ts");
console.info();

runStep("3/3 prettify-changed", "prettify-changed.ts");
console.info();

console.info("check-changed: all steps finished successfully.");
