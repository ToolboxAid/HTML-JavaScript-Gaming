# PR 11.43 — Targeted Sample JSON Cleanup Batch 1

## Purpose
Start the actual cleanup follow-up from PR 11.41 without running the full sample suite by default.

## Background
PR 11.41 audited sample JSON ownership and found deferred cleanup items.

It did not move/delete/update JSON files.

## Required Change
Take the first safe batch of deferred PR 11.41 JSON ownership findings and clean them up surgically.

## Rules
- Do not perform destructive cleanup unless ownership is clear.
- If JSON belongs to the current sample, wire it visibly.
- If JSON clearly belongs to another sample/tool, rehome it.
- If JSON is stale/obsolete and coverage exists elsewhere, delete it.
- If unsure, document it and defer.
- Preserve sample-to-tool/use-case coverage.
- Sample 1902 remains exempt as workspace aggregation sample.

## Testing Rule
Do NOT run the full samples smoke test by default.

The full sample suite takes about 20 minutes.

Prefer targeted tests only:
- syntax check changed JS files
- smoke only changed samples
- tool-specific checks for changed tools

Run the full samples suite only if the change affects shared sample launch infrastructure.

## Scope
- Cleanup only deferred PR 11.41 JSON ownership items.
- Smallest safe batch.
- No broad sample rewrite.
- No hidden/default fallback JSON.
- Do not undo SVG Asset Studio rename.
- Do not touch start_of_day folders.

## Acceptance
- At least one deferred JSON ownership item is resolved.
- Coverage remains preserved.
- Report lists resolved items and deferred items.
- Only targeted tests are run unless shared infrastructure changes require broader validation.
