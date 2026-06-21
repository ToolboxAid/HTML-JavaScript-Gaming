# ProjectInstructions Release Gate

Teams may not start until this release gate passes.

## Required Checks

- [ ] ProjectInstructions folder exists on main.
- [ ] `README.txt` exists.
- [ ] `PROJECT_INSTRUCTIONS.md` exists.
- [ ] `backlog/BACKLOG_MASTER.md` exists.
- [ ] `team_assignments/TEAM_ASSIGNMENTS.md` exists.
- [ ] NATO team names are normalized.
- [ ] Day Work / EOD Merge rule exists.
- [ ] OWNER branch lock rule exists.
- [ ] No protected instructions were deleted.
- [ ] No direct commits to main occurred.
- [ ] Teams may not start until this passes.

## Validation Commands

```text
Test-Path docs_build/dev/ProjectInstructions
Test-Path docs_build/dev/ProjectInstructions/README.txt
Test-Path docs_build/dev/ProjectInstructions/PROJECT_INSTRUCTIONS.md
Test-Path docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md
Test-Path docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md
Run the configured legacy-name search against `docs_build/dev/ProjectInstructions/` and require zero matches.
rg -n "Commit/push during the day is allowed only on assigned team/OWNER/PR branches" docs_build/dev/ProjectInstructions
rg -n "OWNER still has one active assignment at a time|OWNER still has one active branch at a time" docs_build/dev/ProjectInstructions
```

## Pass Rule

This gate passes only when every required check is confirmed.

If any check fails, stop and report:
- failing check
- current branch
- current git status
- recommended owner action
