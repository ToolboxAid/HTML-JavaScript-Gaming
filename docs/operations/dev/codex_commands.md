MODEL: GPT-5.3-codex

TASK:
Perform legacy catalog parity and safe removal.

STEPS:
1. Compare game.manifest.json with legacy catalogs
2. Identify removable files
3. Delete ONLY if safe
4. Document everything

DO NOT:
- break runtime
- modify start_of_day
