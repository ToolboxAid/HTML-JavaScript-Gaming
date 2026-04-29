# PR 11.52 - Controlled JSON Cleanup Batch 8

## Purpose
Continue controlled audit cleanup by removing exactly 8 additional unused sample JSON files.

## Mode
CONTROLLED CLEANUP MODE.

This PR is not a refactor, not a registry change, not a sample-loader change, and not a roadmap rewrite.

## Scope
Allowed:
- Run `scripts/PS/audit-sample-json-js-references.ps1`.
- Select exactly 8 `NO` JSON files from audit output.
- Prefer tool-specific JSON targets such as profiler, replay, pipeline, and 3D tool data.
- Manually validate each selected file before deletion.
- Remove only files proven unused.
- Update docs/dev/reports/PR_11_52_audit_report.md with evidence.
- Update roadmap status markers only if execution-backed and already applicable.

Forbidden:
- Do not touch `palette.json`.
- Do not touch `tile-map-editor-document.json`.
- Do not touch sample 1902 files.
- Do not modify shared loaders, shell, registries, manifests, or tool framework code.
- Do not mass delete.
- Do not guess.
- Do not modify roadmap text except status marker transitions.
- Do not run full sample suite unless shared loader/framework files are changed.

## Required Workflow
1. Run audit script:
   `./scripts/PS/audit-sample-json-js-references.ps1`
2. Save full before output to:
   `docs/dev/reports/PR_11_52_audit_before.txt`
3. Pick exactly 8 safe `NO` JSON targets.
4. For each selected JSON file, run targeted reference checks:
   - exact filename search
   - relative path search where practical
   - sample-local JavaScript reference search
   - broader repo reference search
5. Decision rule:
   - 0 meaningful hits outside audit/report docs = safe to delete
   - any uncertainty = keep and choose another target
6. Delete only the 8 confirmed unused JSON files.
7. Run targeted validation only:
   - rerun audit script
   - confirm NO count decreases by 8
   - verify no missing referenced JSON for affected samples/tools
8. Save after output to:
   `docs/dev/reports/PR_11_52_audit_after.txt`
9. Complete audit report with selected file list, validation evidence, before/after counts, and full-suite test decision.
10. Package final Codex output at:
   `tmp/PR_11_52_CONTROLLED_JSON_CLEANUP_8.zip`

## Acceptance Criteria
- Exactly 8 unused JSON files removed.
- All removed files were audit `NO` before deletion.
- No selected file has direct or indirect repo references.
- Audit after run shows NO count reduced by exactly 8.
- Full sample suite skipped unless shared loader/framework files changed.
- Targeted validation evidence is documented.
- Roadmap content is not rewritten or deleted.
