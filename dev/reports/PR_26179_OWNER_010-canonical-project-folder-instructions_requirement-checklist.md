# PR_26179_OWNER_010-canonical-project-folder-instructions Requirement Checklist

Updated: 2026-06-28T02:50:06Z

- [x] Continued on current branch.
- [x] Documentation/governance only.
- [x] Runtime code not modified.
- [x] Production pages not modified.
- [x] CODEX_WORKFLOW_COMMANDS.md updated so Start of Day requires current branch `main`.
- [x] CODEX_WORKFLOW_COMMANDS.md updated so Start of Day requires clean worktree.
- [x] CODEX_WORKFLOW_COMMANDS.md updated so Start of Day fetches/pulls latest `origin/main`.
- [x] CODEX_WORKFLOW_COMMANDS.md updated so Start of Day verifies local/main origin sync.
- [x] Conflicting `Start of Day must not require the current branch to be main` wording removed.
- [x] Bootstrap doc updated with baseline sync and hard-stop behavior.
- [x] Start of Day read-only rule retained except allowed git sync actions.
- [x] If not on main, SOD HARD STOP correction steps documented.
- [x] Reports/checklists updated.
- [x] git diff --check passed.
- [x] npm run validate:canonical-structure passed.
- [x] node ./dev/scripts/run-platform-validation-suite.mjs passed.
