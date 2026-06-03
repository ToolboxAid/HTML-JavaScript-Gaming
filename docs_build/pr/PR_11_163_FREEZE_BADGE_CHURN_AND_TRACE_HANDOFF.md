# PR_11_163_FREEZE_BADGE_CHURN_AND_TRACE_HANDOFF

## Purpose
Freeze the SVG badge churn and trace the actual Workspace Manager -> tool -> shared shell handoff contract before any rollback or additional implementation.

## Problem Statement
The visible failure is still `Asset: none` after multiple changes. Current evidence says Workspace Manager loads the manifest and SVG Asset Studio receives SVG data, but the badge still does not update. This means the badge may not be owned by the same data path being patched.

## Correct Mental Model to Validate
Workspace Manager loads a workspace manifest and creates/owns tool tiles. Each launched tool receives payload data. The tool may render its own local state, but Workspace Manager/shared shell tile state may be read from a separate tile summary contract, not directly from the launched tool payload.

## Scope
- No schema changes.
- No sample JSON changes.
- No SVG Asset Studio implementation changes.
- No fallback logic.
- No broad cleanup.
- No rollback yet.

## Codex Task
1. Inspect changes since PR_11_159 or the last known committed baseline.
2. Produce a concise report of files changed by PR_11_160 through PR_11_162 attempts.
3. Identify the exact code path that sets the visible `Asset: none` text.
4. Identify whether that text is rendered by:
   - Workspace Manager tile rendering,
   - shared platform shell rendering,
   - SVG Asset Studio rendering,
   - or a duplicated summary/badge renderer.
5. Identify the expected data contract for that renderer.
6. Do not patch behavior unless the owner and contract are proven in the report.

## Acceptance
- Report names the exact file and function/template that emits `Asset: none`.
- Report names the exact input field that renderer expects.
- Report recommends one smallest next PR.
- No implementation code is changed unless the report proves a one-line/small wiring fix and the Codex execution can validate it immediately.
- If rollback is recommended, report the smallest rollback range and files, not a full blind reset.

## Validation
- `git status --short`
- `git diff --name-only HEAD`
- targeted grep for `Asset: none`, `assetName`, `sourceName`, `vectorAssetDocument`, and badge/summary renderers
- no full samples smoke test
