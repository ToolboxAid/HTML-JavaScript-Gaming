# Team Release Readiness Gate

## Purpose

This gate prevents Team Alfa, Team Bravo, Team Charlie, or Team OWNER from starting regular assigned work before the ProjectInstructions operating system is ready.

Current OWNER clarification:
- The current release-readiness gate also applies to Team Delta and Team Gamma.
- Team Gamma is valid and active-capable for now because another PC may be working on it.
- Do not retire Team Gamma unless OWNER explicitly approves retirement.
- Historical wording that listed fewer teams remains traceable, but it must not exclude Delta or Gamma from current active-capable governance.

## Release Rule

Teams may start only when all of the following are true:

- `docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md` exists and is populated.
- `docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md` exists.
- OWNER governance exists.
- One-active-branch-per-team rule exists.
- No-direct-main rule exists.
- Out-of-scope stop rule exists.
- Build Path sync rule exists.

## Gate Outcome

If every requirement is true, team start commands may be issued.

If any requirement is missing, stop and report:
- missing requirement
- expected file or rule
- current branch
- recommended owner action

## No Silent Starts

Teams must not infer readiness from an incomplete stack. Readiness must be documented before team work begins.
