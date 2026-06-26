# Project Instructions Single Source And EOD Main Lock

Status: Approved
Owner: OWNER

## Active Source

`docs_build/dev/ProjectInstructions/` is the only active Project Instructions source for Game Foundry Studio.

Deprecated reference locations must not be used as active instruction sources:
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
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

## Start Of Day Boundary

`docs_build/dev/start_of_day/` may point to `docs_build/dev/ProjectInstructions/`, but it must not become a second active Project Instructions source.
