# PR_26179_OWNER_012-project-instructions-startup-validation Report

## Purpose

Strengthen the Project Instructions startup contract so every Codex task proves it loaded the latest Project Instructions before performing work.

## Branching Model

- Model: Stacked PR
- Previous PR dependency: `PR_26179_OWNER_011-team-stacked-pr-policy` / PR #256
- Starting branch: `PR_26179_OWNER_011-team-stacked-pr-policy`
- Merge order: PR #255, then PR #256, then this PR

## Governance Outcome

- Added `dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS_VERSION.md`.
- Replaced PR-shaped Project Instructions versioning with repository-owned version `2026.06.28.001`.
- Added a mandatory Startup Contract at the top of `PROJECT_INSTRUCTIONS.md`.
- Required Codex to read the version file and latest repository Project Instructions before every task.
- Required Codex to discard remembered Project Instructions in favor of the repository copy.
- Added explicit startup output for `Instruction Source`, proving repository instructions are used and cached memory is discarded.
- Documented that conversation memory must never override repository instructions.
- Required startup validation for canonical paths, branching model, ZIP/report locations, and legacy path avoidance.
- Added failure behavior when the version or canonical paths cannot be determined.
- Documented that the startup validation applies to PLAN, BUILD, APPLY, Review, Audit, Governance, Validation, Read-only, Hard stop, No-op, and Partial completion outcomes.

## Runtime Impact

None. This PR changes documentation/governance only.

## ZIP

- `dev/workspace/zips/PR_26179_OWNER_012-project-instructions-startup-validation_delta.zip`
