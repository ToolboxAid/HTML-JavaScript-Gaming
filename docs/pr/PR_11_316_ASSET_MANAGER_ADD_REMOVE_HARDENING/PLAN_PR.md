# PLAN_PR_11_316

## Purpose
Harden Asset Manager V2 add/remove validation behavior while preserving valid persistence behavior and leaving import/export contracts unchanged.

## Scope
- `tools/asset-manager-v2/index.js`
- `tests/runtime/V2AssetManagerAddRemoveHardening.test.mjs`
- `docs/dev/reports/PR_11_316_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Tighten add-field rejection messaging for blank/whitespace-only values.
2. Keep duplicate asset id rejection explicit and unchanged in behavior.
3. Keep remove-by-id rejection explicit when the id does not exist.
4. Add targeted runtime test coverage for duplicate, blank field, missing remove id, and valid add/remove persistence.
5. Run targeted syntax and targeted Asset Manager runtime test only.
