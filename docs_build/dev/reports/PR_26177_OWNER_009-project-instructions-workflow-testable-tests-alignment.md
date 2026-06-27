# PR_26177_OWNER_009-project-instructions-workflow-testable-tests-alignment

Date: 2026-06-26
Team: OWNER
Branch: PR_26177_OWNER_009-project-instructions-workflow-testable-tests-alignment

## Purpose

Align active Project Instructions with current OWNER decisions for daily workflow, Product Owner testable completion, environment/API invariance, page-level Playwright organization, active team registry consistency, and Sprites ownership/backlog.

## Scope

Governance and backlog documentation only.

No runtime code, UI code, API code, database code, start_of_day files, history snapshots, or unrelated cleanup were changed.

## Changes

- Clarified SOD/day-work/EOD workflow:
  - SOD starts from latest synchronized `main`.
  - Active work happens on one active team, OWNER, or scoped workstream branch.
  - Sequential PRs stay on the active workstream branch during the day.
  - `main` is only the SOD baseline and EOD return target unless OWNER approves a merge checkpoint.
- Added Product Owner testable completion definition.
- Confirmed `Browser -> API -> Database`, one API/service contract across environments, and `Local API` as the shared API running locally.
- Added page-path Playwright organization rules and examples.
- Fixed active team registry mismatch in `TEAM_ASSIGNMENTS.md`.
- Moved Sprites ownership/backlog from Bravo Sprite Studio V2 wording to Team Charlie Sprites canvas editor MVP.
- Removed Category as a Sprites MVP planning requirement.

## Validation

- PASS: documentation-only changed-file check.
- PASS: no runtime files changed.
- PASS: no UI files changed.
- PASS: no API files changed.
- PASS: no database files changed.
- PASS: no `start_of_day` files changed.
- PASS: no history snapshots rewritten.
- PASS: no active instruction permits direct PR commits to `main`.
- PASS: EOD/main-return wording is clarified as closeout or OWNER-approved merge checkpoint, not between stacked/sequential PRs.
- PASS: Product Owner testable definition exists.
- PASS: page-level Playwright organization exists.
- PASS: API/environment wording is consistent.
- PASS: active registry and assignment table agree for current Delta active assignment.

## Artifact

- `tmp/PR_26177_OWNER_009-project-instructions-workflow-testable-tests-alignment_delta.zip`

## Manual Validation Notes

Reviewers should verify that daily team work now has one clear model:

SOD from synchronized `main`, work on active workstream branch, no return to `main` between stacked/sequential PRs, and EOD return to synchronized `main`.
