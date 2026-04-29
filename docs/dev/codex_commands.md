# Codex Command — PR 11.59

Model: GPT-5.4
Reasoning: high

```powershell
codex --model gpt-5.4 --reasoning high "Run PR 11.59 Bulk Metadata-Aware JSON Cleanup. Run scripts/PS/audit-sample-json-js-references.ps1 and capture baseline YES/NO/TOTAL counts. Select up to 32 audit NO JSON files, excluding palette.json, tile-map-editor-document.json, sample 1902, and clearly shared files. If a candidate is only referenced from samples/metadata/samples.index.metadata.json, delete the JSON file and remove the matching stale metadata entry/reference. Do not make framework, loader, roadmap text, or unrelated changes. Re-run the audit and prove NO count decreases by the number of deleted files. Write before/after evidence to docs/dev/reports/PR_11_59_audit_report.md. Document that full samples smoke test was skipped because this is metadata/sample JSON cleanup only and targeted audit validation is sufficient. Create a repo-structured ZIP at tmp/PR_11_59_BULK_METADATA_AWARE_JSON_CLEANUP.zip containing the changed files and report."
```
