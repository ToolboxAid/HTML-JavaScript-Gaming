# TEAM_START_COMMANDS

## Required Main Reset Gate For Every Team

No team creates a PR branch until all checks pass:

- Current branch: `main`
- Worktree: clean
- `main...origin/main`: `0 0`
- `HEAD` SHA matches the published EOD SHA

Use `docs_build/dev/ProjectInstructions/` as the only active Project Instructions source.

START RULE:
- Every team starts on `main`.
- `main` must be clean.
- `main...origin/main` must be `0 0`.
- `HEAD` SHA must match published EOD SHA.
- Only then create or switch to the PR branch.
- No commits are allowed on `main`.

WORK RULE:
- Codex must remain on the PR branch during implementation.
- Codex commits only to the PR branch.
- Codex pushes only the PR branch.
- HARD STOP if branch changes unexpectedly.
- HARD STOP before committing if current branch is `main`.

END RULE:
- After PR validation, push the PR branch.
- Merge PR into `main` only when approved.
- Checkout `main`.
- Run `git fetch origin`.
- Run `git pull --ff-only origin main`.
- Confirm current branch is `main`.
- Confirm worktree is clean.
- Confirm `main...origin/main` is `0 0`.
- Record `HEAD` SHA as new EOD baseline.

## Start Team Alfa

Ready-to-copy command:

```text
OWNER override approved: Start Team Alfa from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Team Alfa from BACKLOG_MASTER.md.
Stop if Team Alfa already has an active branch.
Stop if Team Alfa already has an active assignment.
Stop if no [ ] Team Alfa backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Team Alfa in TEAM_ASSIGNMENTS.md.
Create one Team Alfa branch for the selected assignment.
Work only that assignment.
```

## Start Team Bravo

Ready-to-copy command:

```text
OWNER override approved: Start Team Bravo from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Team Bravo from BACKLOG_MASTER.md.
Stop if Team Bravo already has an active branch.
Stop if Team Bravo already has an active assignment.
Stop if no [ ] Team Bravo backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Team Bravo in TEAM_ASSIGNMENTS.md.
Create one Team Bravo branch for the selected assignment.
Work only that assignment.
```

## Start Team Charlie

Ready-to-copy command:

```text
OWNER override approved: Start Team Charlie from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Team Charlie from BACKLOG_MASTER.md.
Stop if Team Charlie already has an active branch.
Stop if Team Charlie already has an active assignment.
Stop if no [ ] Team Charlie backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Team Charlie in TEAM_ASSIGNMENTS.md.
Create one Team Charlie branch for the selected assignment.
Work only that assignment.
```

## Start Team Delta

Ready-to-copy command:

```text
OWNER override approved: Start Team Delta from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.
Read docs_build/dev/ProjectInstructions/team_assignments/team_ownership.md.

Pull one [ ] item for Team Delta from BACKLOG_MASTER.md.
Stop if Team Delta already has an active branch.
Stop if Team Delta already has an active assignment.
Stop if no [ ] Team Delta backlog item is available.
Stop if the selected item is outside Team Delta ownership.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Team Delta in TEAM_ASSIGNMENTS.md.
Create one Team Delta branch for the selected assignment.
Work only that assignment.
```

## Start Team Golf

Ready-to-copy command:

```text
OWNER override approved: Start Team Golf from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.
Read docs_build/dev/ProjectInstructions/team_assignments/team_ownership.md.

Stop if Team Golf already has an active branch.
Stop if Team Golf already has an active assignment.
Stop if OWNER has not explicitly assigned Team Golf work.
Stop if the selected work conflicts with current Alfa, Bravo, Charlie, or Delta ownership.

Record the selected assignment under Team Golf in TEAM_ASSIGNMENTS.md.
Create or use one Team Golf branch for the selected assignment.
Work only that assignment.
```

## Day Work / EOD Merge Reminder

Ready-to-copy reminder:

```text
Commit/push during the day is allowed only on assigned team/OWNER/PR branches.

Merge to main is EOD-only and owner-approved, unless the owner explicitly says:
"Merge this PR now."

Do not treat sequential PR completion as merge approval.

End of Day:
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main

Required:
On branch main
nothing to commit, working tree clean
0 0

Next Day Start:
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```
