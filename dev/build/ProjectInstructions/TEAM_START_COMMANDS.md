# TEAM_START_COMMANDS

## Required Main Reset Gate For Every Team

Official Start of Day command format lives in:

`dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md`

The ready-to-copy team assignment commands below are OWNER assignment helpers, not Start of Day bootstrap commands.

No team creates a PR branch until all checks pass:

- Current branch: `main`
- Worktree: clean
- `main...origin/main`: `0 0`
- `HEAD` SHA matches the published EOD SHA

Use `dev/build/ProjectInstructions/` as the only active Project Instructions source.
Read `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md` before implementation.

Branch Lifecycle (Canonical):
- Follow `dev/build/ProjectInstructions/addendums/project_instructions_single_source_eod_lock.md` for START / WORK / END lifecycle, branch gates, mandatory hard stops, and EOD main lock.

## Team Migration Note

Alfa, Bravo, Charlie, and historical retired non-canonical lanes must update from current `main` before starting work and use the folder-placement SSoT:

`dev/build/ProjectInstructions/repository/canonical_repository_structure.md`

Do not create or reuse invalid legacy folders. Use the SSoT invalid legacy path list.

If a proposed file does not clearly belong in a canonical folder, HARD STOP and report the proposed path.

## Start Alfa

Ready-to-copy command:

```text
OWNER override approved: Start Alfa from the ProjectInstructions release gate.

Read dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md first.
Read dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Alfa from BACKLOG_MASTER.md.
Stop if Alfa already has an active branch.
Stop if Alfa already has an active assignment.
Stop if no [ ] Alfa backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Alfa in TEAM_ASSIGNMENTS.md.
Create one Alfa branch for the selected assignment.
Work only that assignment.
```

## Start Bravo

Ready-to-copy command:

```text
OWNER override approved: Start Bravo from the ProjectInstructions release gate.

Read dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md first.
Read dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Bravo from BACKLOG_MASTER.md.
Stop if Bravo already has an active branch.
Stop if Bravo already has an active assignment.
Stop if no [ ] Bravo backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Bravo in TEAM_ASSIGNMENTS.md.
Create one Bravo branch for the selected assignment.
Work only that assignment.
```

## Start Charlie

Ready-to-copy command:

```text
OWNER override approved: Start Charlie from the ProjectInstructions release gate.

Read dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md first.
Read dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Charlie from BACKLOG_MASTER.md.
Stop if Charlie already has an active branch.
Stop if Charlie already has an active assignment.
Stop if no [ ] Charlie backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Charlie in TEAM_ASSIGNMENTS.md.
Create one Charlie branch for the selected assignment.
Work only that assignment.
```

## Start Delta

Ready-to-copy command:

```text
OWNER override approved: Start Delta from the ProjectInstructions release gate.

Read dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md first.
Read dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.
Read dev/build/ProjectInstructions/team_assignments/team_ownership.md.

Pull one [ ] item for Delta from BACKLOG_MASTER.md.
Stop if Delta already has an active branch.
Stop if Delta already has an active assignment.
Stop if no [ ] Delta backlog item is available.
Stop if the selected item is outside Delta ownership.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Delta in TEAM_ASSIGNMENTS.md.
Create one Delta branch for the selected assignment.
Work only that assignment.
```

## Start Golf

Ready-to-copy command:

```text
OWNER override approved: Start Golf from the ProjectInstructions release gate.

Read dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md first.
Read dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read dev/build/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.
Read dev/build/ProjectInstructions/team_assignments/team_ownership.md.

Stop if Golf already has an active branch.
Stop if Golf already has an active assignment.
Stop if OWNER has not explicitly assigned Golf work.
Stop if the selected work conflicts with current Alfa, Bravo, Charlie, or Delta ownership.

Record the selected assignment under Golf in TEAM_ASSIGNMENTS.md.
Create or use one Golf branch for the selected assignment.
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

Publish Branch, HEAD SHA, and Date/time. This becomes tomorrow's official baseline.

Also provide the required EOD team summary:
- Team name
- Date
- PRs completed
- PRs merged
- Validation summary
- Overall completion percentage
- Remaining backlog
- Completion percentage for each remaining backlog item
- Recommended first PRs for the next day
- Repository status
```
