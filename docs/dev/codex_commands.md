# Codex Commands — PR 11.64

Model: GPT-5.4
Reasoning: high

```powershell
codex exec --model gpt-5.4 --reasoning high "Run BUILD_PR_LEVEL_11_64_MISSING_REFERENCE_REPAIR_AND_AUDIT_COUNTS_ONLY. Use docs/dev/reports/sample_json_js_reference_audit.csv as source of truth. Repair the 24 remaining missing sample JSON references where safe, remove stale metadata/index-only references, update scripts/PS/audit-sample-json-js-references.ps1 so default output stops after counts/report path, preserve optional detailed output behind -Details, run targeted audit validation only, and write before/after evidence under docs/dev/reports. Do not run the full sample suite. Do not rewrite roadmap text. Package the result as <project folder>/tmp/PR_11_64_MISSING_REFERENCE_REPAIR_AND_AUDIT_COUNTS_ONLY.zip."
```
