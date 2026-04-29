# Codex Commands — PR 11.60

Model: GPT-5.4
Reasoning: high

```powershell
codex exec --model gpt-5.4 --reasoning high "Run PR 11.60 from docs/pr/PR_11_60_BULK_METADATA_AWARE_JSON_CLEANUP.md. Execute the baseline audit, remove up to 32 safe audit-NO JSON files, remove stale samples.index.metadata.json references when they are the only remaining reference, rerun the audit, and write before/after evidence plus cleanup summary under docs/dev/reports. Do not delete protected files, do not refactor, do not rewrite roadmap text, and skip the full samples smoke test with reason documented. Return a repo-structured ZIP artifact at tmp/PR_11_60_BULK_METADATA_AWARE_JSON_CLEANUP.zip."
```
