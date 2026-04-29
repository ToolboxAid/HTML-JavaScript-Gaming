# Codex Commands - PR 11.51

Model: GPT-5.4
Reasoning: medium

```powershell
codex --model gpt-5.4 --reasoning medium "Run PR 11.51 controlled JSON cleanup. Follow docs/pr/PR_11_51_CONTROLLED_JSON_CLEANUP.md exactly. Run the audit script, select exactly two safe tool-specific NO JSON files, manually validate direct and broader references, remove only proven unused files, update docs/dev/reports/PR_11_51_audit_report.md with before/after counts and validation evidence, update only roadmap status markers if execution-backed, and package the final repo-structured artifact at tmp/PR_11_51_CONTROLLED_JSON_CLEANUP.zip. Do not run the full sample suite unless shared loader/framework files are changed."
```
