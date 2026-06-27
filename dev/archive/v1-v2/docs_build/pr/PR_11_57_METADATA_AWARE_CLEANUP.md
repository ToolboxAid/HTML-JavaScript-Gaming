# PR 11.57 — Metadata-Aware JSON Cleanup

## Purpose
Continue controlled JSON cleanup with count-backed proof by removing 8 unused JSON files and their stale metadata/index references.

## Scope
- Run `scripts/PS/audit-sample-json-js-references.ps1` before changes.
- Select exactly 8 audit `NO` JSON files.
- Validate each candidate is not directly or indirectly used by JS/runtime.
- If the only broad repo reference is `samples/metadata/samples.index.metadata.json`, treat it as stale metadata and remove that metadata entry/reference too.
- Delete the unused JSON files.
- Re-run audit and prove `NO count` drops by 8.

## Hard Exclusions
- Do not touch `palette.json`.
- Do not touch `tile-map-editor-document.json`.
- Do not touch sample 1902.
- Do not modify roadmap text except execution-backed status markers if already required.
- Do not run full samples suite.

## Acceptance
- 8 unused JSON files deleted.
- Matching stale references removed from `samples/metadata/samples.index.metadata.json`.
- Before/after audit evidence captured in `docs_build/dev/reports/PR_11_57_audit_before.txt` and `docs_build/dev/reports/PR_11_57_audit_after.txt`.
- `NO count` decreases by exactly 8, unless fewer than 8 safe candidates remain; if fewer remain, document why and remove all safe candidates.
- Targeted validation notes captured in `docs_build/dev/reports/PR_11_57_validation.md`.
