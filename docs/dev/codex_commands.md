# Codex Commands — PR 11.75

Model: GPT-5.4
Reasoning: high

```powershell
codex --model gpt-5.4 --reasoning high "Run PR 11.75 utils consolidation. Read docs/pr/PR_11_75_UTILS_CONSOLIDATION.md. Inventory src/engine/utils and src/shared/utils at file and exported-method level. Consolidate only true shared-safe duplicates into src/shared/utils, keep engine-bound utilities in src/engine/utils, update imports, remove duplicate implementation files only after imports are updated, and write reports under docs/dev/reports. Do not create wrappers, alias files, bridge exports, pass-through variables, or broad refactors. Run targeted syntax/import validation only."
```
