# PR_26180_OWNER_003 Backlog Startup Assignment Policy Report

## Executive Summary

PASS: This PR updates Project Instructions so team startup must load `BACKLOG_MASTER.md`, report assigned product work by team/product area, and treat Admin Tool Votes as the priority signal source for tool demand and Owner/Admin review.

The change is governance/documentation only. No runtime, UI, API, database, or tool implementation files were modified.

Project Instructions version was bumped to `2026.06.28.003`.

## Scope Decision

Updated active Project Instructions and the backlog header only.

`admin/tool-votes.html` was identified as the current Tool Votes/Admin Owner priority signal source. It was not modified because this PR is governance-only and the user explicitly prohibited UI/tool implementation changes.

## Source Discovery

| Source | Path | Status |
|---|---|---|
| Authoritative backlog | `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md` | Found |
| Team backlog/SOD/EOD standard | `dev/build/ProjectInstructions/addendums/team_backlog_sod_eod_standard.md` | Updated |
| Start of Day bootstrap architecture | `dev/build/ProjectInstructions/bootstrap/codex_start_of_day_bootstrap.md` | Updated |
| Codex workflow commands | `dev/build/ProjectInstructions/standards/CODEX_WORKFLOW_COMMANDS.md` | Updated |
| Team start commands | `dev/build/ProjectInstructions/TEAM_START_COMMANDS.md` | Updated |
| Tool Votes/Admin Owner priority signal | `admin/tool-votes.html` | Found, not modified |

## Changes

- Added `BACKLOG_MASTER.md` as the authoritative assigned product work source in active startup/team governance.
- Added `admin/tool-votes.html` as the Tool Votes/Admin Owner priority signal source.
- Added the required Team Assignment startup output table.
- Added hard-stop behavior for missing backlog, missing assigned team, missing product-area representation, and missing Tool Votes priority source.
- Updated `BACKLOG_MASTER.md` header to state assigned-work ownership, status update expectations, current Team/Product Area status-source ownership, and required product-area status/percent complete.
- Corrected `BACKLOG_MASTER.md` to mark team-aware local dev bootstrap runtime as complete, including `dev:bootstrap`, `team-port-config.mjs`, `--team` support, bootstrap orchestration, browser launch reporting, and port resolution.
- Updated Start of Day command/bootstrap docs to require the Team Assignment section.
- Added top-level `PROJECT_INSTRUCTIONS.md` pointers for the team backlog/startup assignment standard and Tool Votes priority source.

## Bootstrap Status Correction

Team-aware dev bootstrap is implemented and must not be assigned as remaining backlog work.

Owner-provided verification:

```text
npm run dev:bootstrap -- --team bravo
GameFoundry team-aware dev bootstrap
Mode: bootstrap
Team: bravo
Web URL: http://127.0.0.1:5520
API URL: http://127.0.0.1:5521/api
Browser launch: http://127.0.0.1:5520/index.html
Supported teams: owner, alfa, bravo, charlie, delta, echo, foxtrot, golf, hotel
Legacy API alias remains: npm run dev:local-api
```

Corrected implemented items:

- `npm run dev:bootstrap`
- `dev/bootstrap/team-port-config.mjs`
- team-aware `--team` runtime support
- bootstrap orchestration
- browser launch reporting
- port resolution
- legacy `npm run dev:local-api` alias

## Backlog Canonical Structure Correction

`BACKLOG_MASTER.md` now states:

```text
BACKLOG_MASTER.md is now the canonical team/product-area assignment and status source. Future backlog changes must update this structure directly.
```

This removes wording that implied team/product-area backlog normalization was a future activity.

## Rebase Notes

- Rebased onto current `origin/main` after Owner 035 merged.
- Merge conflicts were limited to generated report artifacts: `dev/reports/codex_changed_files.txt` and `dev/reports/codex_review.diff`.
- Owner 035 runtime/API/auth files from `main` were preserved unchanged.
- Owner 003 remains governance/documentation-only.

## Owner Recommendation

Use `dev/build/ProjectInstructions/backlog/BACKLOG_MASTER.md` as the required assigned-work source during startup and use `admin/tool-votes.html` as the priority signal source for tool demand. When either source is missing or does not represent the requested work, Codex must stop and ask OWNER whether to update the backlog before proceeding.

## Validation

| Check | Result |
|---|---|
| Branch validation | PASS |
| `git diff --check` | PASS |
| `npm run validate:canonical-structure` | PASS |
| Runtime/UI/API/DB implementation files changed | PASS - none changed |
| Bootstrap/runtime implementation recreated | PASS - not recreated; backlog status only |

## Artifact

Repo-structured outcome ZIP:

```text
dev/workspace/zips/PR_26180_OWNER_003-backlog-startup-assignment-policy_delta.zip
```
