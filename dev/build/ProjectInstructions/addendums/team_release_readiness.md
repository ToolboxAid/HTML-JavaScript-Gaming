# Team Release Readiness Gate

## Purpose

This gate prevents Team Alfa, Team Bravo, Team Charlie, or Team OWNER from starting regular assigned work before the ProjectInstructions operating system is ready.

Current OWNER clarification:
- This gate also applies to Team Delta and Team Golf.
- Team Gamma is retired. Team Golf is the replacement active ownership lane.
- Historical wording that listed fewer teams remains traceable, but it must not exclude Delta or Golf from current active ownership governance.

## Release Rule

Teams may start only when all of the following are true:

- `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md` exists and is populated.
- `dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md` exists.
- OWNER governance exists.
- One-active-branch-per-team rule exists.
- No-direct-main rule exists.
- Canonical START / WORK / END lifecycle exists.
- Out-of-scope stop rule exists.
- Build Path sync rule exists.
- PR lifecycle states exist in order: PR Open, Plan, Build, Validation, Approved, Merged, Main Verified, Closed.
- START requires synchronized `main`, clean worktree, `main...origin/main` `0 0`, and HEAD matching published EOD SHA before branch creation.
- WORK requires remaining on the PR branch.
- END requires merge, return to synchronized `main`, and publishing branch, HEAD SHA, and date/time.
- Previous-PR Closed gate exists before a team starts another PR, except explicitly documented stacked PR chains.
- Final closeout output includes branch, worktree, local/origin sync, PR number/name, PR status, merge/final commit, branch disposition, backlog update status, tool state update status, ZIP path, and Closeout PASS/FAIL.

## Gate Outcome

If every requirement is true, team start commands may be issued.

If any requirement is missing, stop and report:
- missing requirement
- expected file or rule
- current branch
- recommended owner action

## No Silent Starts

Teams must not infer readiness from an incomplete stack. Readiness must be documented before team work begins.
