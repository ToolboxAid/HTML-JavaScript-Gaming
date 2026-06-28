# PR_26180_OWNER_004 Repository Layout Architecture Plan Report

## Executive Summary

PASS: Added a documentation/governance-only architecture plan for future repository layout simplification before any file moves.

The proposed future layout is:

- `www/` = browser-served application
- `api/` = Node/API/server application
- `dev/` = developer-only workspace

No files were moved. No runtime, UI, API implementation, database implementation, or `package.json` command changes were made.

## Changes

- Added `dev/build/ProjectInstructions/repository/repository_layout_architecture_plan.md`.
- Updated `PROJECT_INSTRUCTIONS.md` to reference the new proposed layout plan.
- Bumped Project Instructions version to `2026.06.28.004`.
- Updated `BACKLOG_MASTER.md` with Owner planned work:
  - Team: Owner
  - Product Area: Repository Architecture Simplification
  - Status: Planned
  - Percent Complete: 0%
  - Next Milestone: Architecture plan

## Architecture Plan Coverage

| Required Topic | Result |
|---|---|
| Proposed `www/`, `api/`, `dev/` layout | PASS |
| Deployment model | PASS |
| Browser/API/database flow | PASS |
| Developer local-runtime flow | PASS |
| Migration strategy | PASS |
| Stacked PR sequence | PASS |
| No feature work mixed into migration | PASS |
| Runtime must never depend on `dev/` | PASS |
| Browser must never own authoritative product data | PASS |

## Scope Validation

Changed files are limited to Project Instructions, backlog governance, and reports.

Implementation files, runtime code, UI files, API implementation files, database implementation files, and package commands were not changed.

## Artifact

Repo-structured outcome ZIP:

```text
dev/workspace/zips/PR_26180_OWNER_004-repository-layout-architecture-plan_delta.zip
```
