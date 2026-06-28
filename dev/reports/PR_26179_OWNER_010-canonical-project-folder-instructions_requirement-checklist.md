# PR_26179_OWNER_010-canonical-project-folder-instructions Requirement Checklist

Updated: 2026-06-28T02:32:48Z

- [x] Continued on current branch.
- [x] Documentation/governance only.
- [x] Runtime code not modified.
- [x] Production pages not modified.
- [x] Canonical teams set to Owner, Alfa, Bravo, Charlie, Delta, Golf.
- [x] Active Alpha references replaced.
- [x] Active Gamma references replaced or removed.
- [x] Non-canonical active team-name examples removed.
- [x] Start of Day examples updated.
- [x] PROJECT_STATE.md transient current PR/current branch/worktree fields removed.
- [x] PROJECT_STATE.md required repository-truth fields present.
- [x] Start of Day documented as read-only discovery only.
- [x] PLAN_PR, BUILD_PR, and APPLY_PR documented as execution phases after Start of Day.
- [x] Lifecycle Start of Day -> PLAN_PR -> BUILD_PR -> APPLY_PR documented.
- [x] git diff --check passed.
- [x] npm run validate:canonical-structure passed.
- [x] node ./dev/scripts/run-platform-validation-suite.mjs passed.
- [x] Alpha/Gamma/non-canonical team-name grep passed with no historical exceptions.
