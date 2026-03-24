import { execFileSync } from "node:child_process";

const maxBuffer = 10 * 1024 * 1024;

function gitLines(args: string[]): string[] {
  try {
    return execFileSync("git", args, { encoding: "utf8", maxBuffer })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function assertInsideGitWorkTree(scriptLabel: string): void {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      stdio: "ignore",
    });
  } catch {
    console.error(`${scriptLabel}: not a git repository`);
    process.exit(1);
  }
}

/**
 * Paths to files that differ from what would be committed: unstaged edits on
 * tracked files, staged edits (including newly `git add`ed files), and untracked
 * files (respects .gitignore via --exclude-standard).
 */
export function getChangedGitPathLines(): string[] {
  const unstaged = gitLines(["diff", "--name-only", "--diff-filter=ACM"]);
  const staged = gitLines([
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=ACM",
  ]);
  const untracked = gitLines(["ls-files", "--others", "--exclude-standard"]);

  return [...new Set([...unstaged, ...staged, ...untracked])];
}
