# TEAM_START_COMMANDS

## Start Team Alpha

Ready-to-copy command:

```text
OWNER override approved: Start Team Alpha from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Team Alpha from BACKLOG_MASTER.md.
Stop if Team Alpha already has an active branch.
Stop if Team Alpha already has an active assignment.
Stop if no [ ] Team Alpha backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Team Alpha in TEAM_ASSIGNMENTS.md.
Create one Team Alpha branch for the selected assignment.
Work only that assignment.
```

## Start Team Beta

Ready-to-copy command:

```text
OWNER override approved: Start Team Beta from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Team Beta from BACKLOG_MASTER.md.
Stop if Team Beta already has an active branch.
Stop if Team Beta already has an active assignment.
Stop if no [ ] Team Beta backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Team Beta in TEAM_ASSIGNMENTS.md.
Create one Team Beta branch for the selected assignment.
Work only that assignment.
```

## Start Team Gamma

Ready-to-copy command:

```text
OWNER override approved: Start Team Gamma from the ProjectInstructions release gate.

Read docs_build/dev/ProjectInstructions/README.txt first.
Read docs_build/dev/ProjectInstructions/backlog/BACKLOG_MASTER.md.
Read docs_build/dev/ProjectInstructions/team_assignments/TEAM_ASSIGNMENTS.md.

Pull one [ ] item for Team Gamma from BACKLOG_MASTER.md.
Stop if Team Gamma already has an active branch.
Stop if Team Gamma already has an active assignment.
Stop if no [ ] Team Gamma backlog item is available.

Change the selected backlog item from [ ] to [.].
Add the selected assignment under Team Gamma in TEAM_ASSIGNMENTS.md.
Create one Team Gamma branch for the selected assignment.
Work only that assignment.
```

## Day Work / EOD Merge Reminder

Ready-to-copy reminder:

```text
Commit/push during the day is allowed only on assigned team/OWNER/PR branches.

Merge to main is EOD-only and owner-approved, unless the owner explicitly says:
"Merge this PR now."

Do not treat sequential PR completion as merge approval.
```

## Branch Persistence And Context Reminder

Ready-to-copy reminder:

```text
After a branch is created, the team remains on that active branch.

This applies to:
- Team Alfa through Team Zulu
- Team OWNER

Do not automatically return to main after:
- commit
- push
- draft PR creation
- testing
- bug fixes
- additional commits

Only return to main when:
- the PR is merged
- the branch is retired
- the owner explicitly says: "Return to main"

The active branch is the working context.

At the beginning of every work session, Codex must report:
- current branch
- expected branch
- active team
- active assignment

If not on the assigned team/OWNER branch:

STOP.

Report:
- expected branch
- current branch
- required action

Do not continue until the branch context is corrected or owner override is provided.
```
