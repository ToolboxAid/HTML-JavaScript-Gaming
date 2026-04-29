# Codex Commands — PR 11.57

Model: GPT-5.4
Reasoning: high

```powershell
codex --model gpt-5.4 --reasoning high "Execute PR 11.57 metadata-aware controlled JSON cleanup. Run .\scripts\PS\audit-sample-json-js-references.ps1 and save before output to docs/dev/reports/PR_11_57_audit_before.txt. Select exactly 8 audit NO JSON files that are tool-specific and safe. Exclude palette.json, tile-map-editor-document.json, sample 1902, shared assets, and ambiguous files. For each candidate, validate JS/runtime references. If the only broad repo reference is samples/metadata/samples.index.metadata.json, remove the stale metadata/index reference and delete the JSON. Save validation notes to docs/dev/reports/PR_11_57_validation.md. Re-run the audit and save after output to docs/dev/reports/PR_11_57_audit_after.txt. Confirm NO count decreases by 8 or document fewer safe remaining candidates. Use targeted validation only; do not run the full samples suite. Keep scope surgical and do not refactor." 
```
