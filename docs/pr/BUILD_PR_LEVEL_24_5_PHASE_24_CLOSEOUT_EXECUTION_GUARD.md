# BUILD_PR_LEVEL_24_5_PHASE_24_CLOSEOUT_EXECUTION_GUARD

## Purpose
Close Level 24 with one small, testable, execution-backed PR.

This replaces the prior non-executable `24_5` planning stub.
No roadmap advancement happens in this PR.
No commit-only packaging.
No roadmap text edits.

## Why this PR is needed
Phase 24 roadmap items are already complete.
What is missing is a final executable guard so Phase 24 ends on a testable artifact rather than a docs-only/status-only tail.

## Single PR Purpose
Add one runnable guard entry point that checks both of these locked rules:
1. Roadmap file is locked against non-status edits.
2. Fullscreen remains restricted to sample `0713`.

## In Scope
- add one guard script or one guard test entry point
- make it runnable in one pass from the repo root
- validate:
  - roadmap file path is unchanged
  - roadmap content is not replaced/renamed
  - fullscreen usage outside `samples/phase-07/0713` fails
- add minimal documentation for how to run the guard
- add test/report output under docs/dev/reports if useful

## Out of Scope
- no roadmap text edits
- no roadmap status changes
- no engine changes
- no gameplay changes
- no sample feature work
- no broad repo cleanup
- no template-driven expansion

## Preferred Implementation Shape
Choose the smallest executable option already aligned with repo tooling:
- either a focused Node test
- or a focused PowerShell validator
- or both only if one invokes the other and remains one-pass executable

Prefer PowerShell if it reduces Codex token usage.

## Required Behavior
The guard must fail if any of the following are true:
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` is renamed or replaced
- roadmap text is rewritten, reordered, added to, deleted from, or reflowed
- any non-status roadmap edit is detected
- fullscreen usage exists outside sample `0713`

The guard must pass when:
- roadmap remains locked
- only status-marker transitions are allowed in principle
- fullscreen hits remain limited to the known `0713` files

## Run
- `npm run check:phase24-closeout-guard`

## Acceptance
- one-pass executable from repo root
- testable and repeatable
- no roadmap edits required
- no engine/gameplay changes
- guard clearly reports pass/fail
- package output to:
  `<project folder>/tmp/BUILD_PR_LEVEL_24_5_PHASE_24_CLOSEOUT_EXECUTION_GUARD.zip`
