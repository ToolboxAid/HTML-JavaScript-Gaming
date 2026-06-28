# PR_26179_OWNER_010-canonical-project-folder-instructions Requirement Checklist

Updated: 2026-06-28T02:44:56Z

- [x] Continued on current branch.
- [x] Documentation/governance only.
- [x] Runtime code not modified.
- [x] Production pages not modified.
- [x] Codex Completion Contract documented.
- [x] Every Codex execution requires at least one repository-structured ZIP.
- [x] Each attempted PR requires exactly one final outcome ZIP.
- [x] Missing ZIP means the Codex run did not complete correctly.
- [x] Canonical ZIP location documented as `dev/workspace/zips/`.
- [x] ZIP suffixes documented.
- [x] Stacked PR ZIP rule documented.
- [x] Failure/hard-stop ZIP contents documented.
- [x] Success ZIP contents documented.
- [x] Start of Day, PLAN_PR, BUILD_PR, and APPLY_PR docs reference the completion contract.
- [x] Conflicting exactly-one-per-execution wording checked.
- [x] git diff --check passed.
- [x] npm run validate:canonical-structure passed.
- [x] node ./dev/scripts/run-platform-validation-suite.mjs passed.
