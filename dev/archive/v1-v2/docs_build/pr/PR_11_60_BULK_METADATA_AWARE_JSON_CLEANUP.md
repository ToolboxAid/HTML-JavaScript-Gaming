# PR 11.60 — Bulk Metadata-Aware JSON Cleanup

## Purpose
Reduce the audit NO / missing-reference count with a real execution-backed cleanup batch.

## Scope
- Batch size: 32 audit-confirmed unused JSON files.
- Remove matching stale entries from `samples/metadata/samples.index.metadata.json` when the metadata index is the only remaining reference.
- Do not delete protected or ambiguous assets.

## Protected Files / Areas
Do not delete or modify these as cleanup targets:
- `palette.json`
- `tile-map-editor-document.json`
- anything under sample `1902`
- shared assets
- ambiguous indirectly-used assets

## Required Codex Flow
1. Run baseline audit:
   ```powershell
   .\scripts\PS\audit-sample-json-js-references.ps1
   ```
2. Capture baseline YES / NO / TOTAL counts in `docs_build/dev/reports/PR_11_60_audit_before.txt`.
3. Select up to 32 `NO` JSON items that are not protected.
4. For each selected item:
   - delete the unused JSON file
   - if the only reference is `samples/metadata/samples.index.metadata.json`, remove that stale metadata entry too
5. Do not perform broad refactors.
6. Do not rewrite roadmap text.
7. Run the audit again.
8. Capture after counts in `docs_build/dev/reports/PR_11_60_audit_after.txt`.
9. Add a short summary report in `docs_build/dev/reports/PR_11_60_cleanup_summary.md` listing deleted JSON files and metadata entries removed.

## Acceptance
- Audit NO count decreases compared to baseline.
- JSON deletions and metadata index cleanup are applied together.
- No protected files are deleted.
- Full samples smoke test is skipped because this is asset/index cleanup only.
- Targeted validation is documented in the summary report.
