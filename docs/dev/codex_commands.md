# Codex Command — PR 11.61

Model: GPT-5.4
Reasoning: high

```text
Run BUILD_PR_LEVEL_11_61_BULK_METADATA_AWARE_JSON_CLEANUP_64.

Repository: C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming

Objective:
Remove 64 additional audit-confirmed unused sample JSON files and clean stale metadata references so the audit NO/missing-reference count decreases.

Execution rules:
1. Run .\scripts\PS\audit-sample-json-js-references.ps1 and record baseline YES/NO/TOTAL counts.
2. Select up to 64 eligible NO JSON entries.
3. Do not select protected items:
   - palette.json
   - tile-map-editor-document.json
   - sample 1902
   - shared or ambiguous files
4. For each selected JSON:
   - If only remaining broad reference is samples/metadata/samples.index.metadata.json, delete the JSON and remove the matching metadata reference.
   - If referenced by executable JS or uncertain shared usage, skip and report.
5. Use git rm for removed JSON files.
6. Edit samples/metadata/samples.index.metadata.json only to remove stale entries/references for deleted JSON files.
7. Run the audit script again and record final YES/NO/TOTAL counts.
8. Confirm NO count decreased by the number of removed audit-counted entries, or explain every skip.
9. Run targeted validation only. Do not run full samples smoke test unless shared loader/framework code was modified.
10. Write report to docs/dev/reports/PR_11_61_bulk_metadata_cleanup_report.md.
11. Place final artifact at <project folder>\tmp\PR_11_61_BULK_METADATA_AWARE_JSON_CLEANUP_64.zip.

Do not refactor. Do not modify loader/framework/tool code. Do not rewrite roadmap content.
```
