# PR_26124_014-include-review-diff

## Summary
- Added end-of-run artifact generator script for Codex PR review outputs.
- Added npm command: `npm run codex:review-artifacts`.
- Added command entry to `docs_build/dev/codex_commands.md`.

## Files Changed
- `scripts/write-codex-review-artifacts.mjs`
- `package.json`
- `docs_build/dev/codex_commands.md`

## Validation
- `node --check scripts/write-codex-review-artifacts.mjs` -> pass
- `npm run codex:review-artifacts` -> pass

## Artifact Confirmation
- `docs_build/dev/reports/codex_review.diff` exists
- `docs_build/dev/reports/codex_changed_files.txt` exists
