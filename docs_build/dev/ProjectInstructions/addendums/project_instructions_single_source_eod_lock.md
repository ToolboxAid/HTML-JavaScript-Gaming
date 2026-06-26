# Project Instructions Single Source And EOD Main Lock

Status: Approved
Owner: OWNER

## Active Source

`docs_build/dev/ProjectInstructions/` is the only active Project Instructions source for Game Foundry Studio.

Only this folder may contain active Project Instructions. Deprecated reference locations must not be used as active instruction sources:
- root-level copies in `docs_build/dev/`
- `project-instructions/`
- archived Project Instructions snapshots
- generated PR reports

If deprecated reference material conflicts with `docs_build/dev/ProjectInstructions/`, the active folder wins unless OWNER explicitly approves a newer governance change.

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

No team creates a PR branch until:
- Current branch: `main`
- Worktree: clean
- `main...origin/main`: `0 0`
- `HEAD` SHA matches published EOD SHA

If any check fails, stop before branch creation and restore main to the published EOD state or request OWNER direction.

## Branch Lifecycle (Canonical)

Every PR follows exactly three phases:

```text
START
WORK
END
```

## START

Every team begins on `main`.

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

Only after ALL four pass may a branch be created.

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
- Push only the PR branch.
- Execute validation from the PR branch.
- Open/update the PR from the PR branch.

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
- new PR started before returning to synchronized `main`

## Start Of Day Boundary

`docs_build/dev/start_of_day/` may point to `docs_build/dev/ProjectInstructions/`, but it must not become a second active Project Instructions source.
