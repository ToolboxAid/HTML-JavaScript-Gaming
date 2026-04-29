# Codex Commands — PR 11.81

Model: GPT-5.4
Reasoning: high

Run Codex with this task:

```text
You are applying PR 11.81. Expand the utilities audit only. Do not delete, move, or rewrite implementation files.

Inspect src/shared/utils/** and any remaining src/engine/utils/**.

Create these reports:
- docs/dev/reports/utils_dead_usage_audit.md
- docs/dev/reports/utils_duplicate_exports_audit.md
- docs/dev/reports/utils_folder_category_audit.md
- docs/dev/reports/utils_audit_summary.csv

Report:
1. unused utility files and unused named exports
2. duplicate or near-duplicate exports across utility files
3. folder-category mismatches, especially generic utilities still under src/engine/utils
4. every remaining literal reference to src/engine/utils/ and /src/engine/utils/

Do not change implementation code. Do not create wrappers, aliases, or pass-through files. This PR is report-only.
```
