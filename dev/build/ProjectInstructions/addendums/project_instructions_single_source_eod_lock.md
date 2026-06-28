# Project Instructions Single Source And EOD Main Lock

Status: Approved
Owner: OWNER

## Active Source

`dev/build/ProjectInstructions/` is the only active Project Instructions source for Game Foundry Studio.

Only this folder may contain active Project Instructions. Deprecated reference locations must not be used as active instruction sources:
- root-level copies in `dev/build/dev/`
- archived Project Instructions snapshots
- generated PR reports

If deprecated reference material conflicts with `dev/build/ProjectInstructions/`, the active folder wins unless OWNER explicitly approves a newer governance change.

## End Of Day

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
```

Required:

```text
On branch main
nothing to commit, working tree clean
0 0
```

The EOD report must record the final `HEAD` SHA as the published EOD SHA.

## Next Day Start

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```

## Team Branch Creation Gate

For Independent PRs and for the first PR in a new stacked workstream, no team creates a PR branch until:
- Current branch: `main`
- Worktree: clean
- `main...origin/main`: `0 0`
- `HEAD` SHA matches published EOD SHA

For dependent Stacked PRs, the start branch may be the documented previous PR branch only when `dev/build/ProjectInstructions/addendums/pr_workflow.md` identifies a direct dependency and dependency order.

OWNER PRs may start from synchronized `main` when marked Independent and no direct dependency exists.

A non-Owner team PR may start from `main` only when OWNER explicitly marks the PR as `standalone/no-dependency`. Otherwise, non-Owner team PRs use Stacked PR workstreams by default and must start from the active team workstream branch or documented previous PR branch.

If any required check fails, or if the current branch does not match the requested PR model, stop before branch creation and restore the expected branch state or request OWNER direction.

## Branch Lifecycle (Canonical)

Every PR follows exactly three phases:

```text
START
WORK
END
```

## START

Every team begins SOD from `main`.

Required:

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```

Required results:

```text
Current branch: main
Working tree clean
main...origin/main
0 0
HEAD equals published EOD SHA
```

Only after ALL required checks for the requested PR branching model pass may a branch be created or the active team branch/workstream be updated.

Create the PR branch:

```text
git switch -c PR_<name>
```

Rules:

- No commits on `main`.
- No implementation on `main`.
- No validation on `main` except start validation.

## WORK

From branch creation until merge:

- Remain on the PR branch.
- Never checkout `main`.
- Commit only on the PR branch.
- Work must be committed only to the active team branch.
- Push only the PR branch.
- Execute validation from the PR branch.
- Open/update the PR from the PR branch.
- For OWNER-approved stacked/sequential workstreams, PR branches/commits stay on the active team branch/workstream between sequential PRs during the day.
- Do not return to `main` between sequential PRs in the same active workstream unless OWNER explicitly approves an EOD or intermediate merge checkpoint.
- This rule applies to all canonical teams: Owner, Alfa, Bravo, Charlie, Delta, and Golf.

Hard Stops:

```text
If current branch == main before commit:
    STOP

If current branch changes unexpectedly:
    STOP

If attempting to push main:
    STOP
```

## END

After validation succeeds:

```text
Commit
Push PR branch
Open/update PR
Merge PR
```

Immediately execute:

```text
git checkout main
git fetch origin
git pull --ff-only origin main
git status
git rev-list --left-right --count main...origin/main
git rev-parse HEAD
```

Required result:

```text
Current branch: main
Working tree clean
main...origin/main
0 0
```

Publish:

```text
Branch
HEAD SHA
Date/time
```

This becomes tomorrow's official baseline.

Stop all work.

## Daily Synchronization

End of every day publish:

```text
Branch: main
HEAD SHA
```

Every team must begin tomorrow from that exact SHA.

## Mandatory Hard Stops

STOP if:

- current branch is `main` before commit
- worktree dirty before creating PR branch
- `main...origin/main` is not `0 0` before creating PR branch
- `HEAD` SHA differs from published baseline
- merge attempted without successful validation
- new unrelated PR or workstream started before returning to synchronized `main`
- sequential work continues without an OWNER-approved stacked/sequential workstream model

## Start Of Day Boundary

Legacy `start_of_day/` folders are retired and must not become a second active Project Instructions source. Active start governance lives under `dev/build/ProjectInstructions/`.
