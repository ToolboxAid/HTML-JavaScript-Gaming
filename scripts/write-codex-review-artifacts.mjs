import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const reportsDirectory = resolve(repoRoot, "docs_build", "dev", "reports");
const reviewDiffPath = resolve(reportsDirectory, "codex_review.diff");
const changedFilesPath = resolve(reportsDirectory, "codex_changed_files.txt");

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 256
  });
  if (result.error) {
    throw result.error;
  }
  return result;
}

function assertGitCommand(result, args) {
  if (result.status !== 0) {
    const commandText = `git ${args.join(" ")}`;
    const stderr = result.stderr && result.stderr.trim() ? result.stderr.trim() : "Unknown git error";
    throw new Error(`${commandText} failed: ${stderr}`);
  }
}

const stagedCheck = runGit(["diff", "--cached", "--quiet"]);
if (stagedCheck.status !== 0 && stagedCheck.status !== 1) {
  const stderr = stagedCheck.stderr && stagedCheck.stderr.trim() ? stagedCheck.stderr.trim() : "Unknown git error";
  throw new Error(`git diff --cached --quiet failed: ${stderr}`);
}

const useCachedDiff = stagedCheck.status === 1;
const reviewDiffArguments = useCachedDiff ? ["diff", "--cached"] : ["diff"];
const reviewDiffResult = runGit(reviewDiffArguments);
assertGitCommand(reviewDiffResult, reviewDiffArguments);

const untrackedFilesResult = runGit(["ls-files", "--others", "--exclude-standard"]);
assertGitCommand(untrackedFilesResult, ["ls-files", "--others", "--exclude-standard"]);
const untrackedFiles = untrackedFilesResult.stdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
const untrackedDiff = untrackedFiles
  .map((filePath) => {
    const diffResult = runGit(["diff", "--no-index", "--", "/dev/null", filePath]);
    if (diffResult.status !== 0 && diffResult.status !== 1) {
      const stderr = diffResult.stderr && diffResult.stderr.trim() ? diffResult.stderr.trim() : "Unknown git error";
      throw new Error(`git diff --no-index -- /dev/null ${filePath} failed: ${stderr}`);
    }
    return diffResult.stdout.trimEnd();
  })
  .filter(Boolean)
  .join("\n");

const statusShortResult = runGit(["status", "--short"]);
assertGitCommand(statusShortResult, ["status", "--short"]);

const diffStatResult = runGit(["diff", "--stat"]);
assertGitCommand(diffStatResult, ["diff", "--stat"]);

mkdirSync(reportsDirectory, { recursive: true });
const reviewDiffText = [
  reviewDiffResult.stdout.trimEnd(),
  untrackedDiff
].filter(Boolean).join("\n");
writeFileSync(reviewDiffPath, reviewDiffText ? `${reviewDiffText}\n` : "", "utf8");

const changedFilesReport = [
  `# git status --short`,
  statusShortResult.stdout.trim() ? statusShortResult.stdout.trim() : "(no output)",
  "",
  `# git ls-files --others --exclude-standard`,
  untrackedFiles.length ? untrackedFiles.join("\n") : "(no output)",
  "",
  `# git diff --stat`,
  diffStatResult.stdout.trim() ? diffStatResult.stdout.trim() : "(no output)"
].join("\n");

writeFileSync(changedFilesPath, changedFilesReport, "utf8");

console.log(`Wrote ${reviewDiffPath} using git ${reviewDiffArguments.join(" ")}`);
console.log(`Wrote ${changedFilesPath}`);
