# Project Instructions Version

Current Project Instructions Version: 2026.06.28.015

Last Updated: 2026-06-28

## Breaking Changes Summary

- Codex startup validation is mandatory before every task outcome.
- Project Instructions versions are repository-owned and increment independently of PR numbers.
- Added dedicated branching policy document.
- Startup validation now verifies the branching policy document was loaded instead of duplicating policy text.
- Added backlog startup assignment policy requiring `BACKLOG_MASTER.md` and Tool Votes/Admin Owner priority signal review during team startup.
- Added proposed repository layout architecture plan for future `www/`, `api/`, and `dev/` separation.
- Added repository layout scaffold governance for `www/`, `api/`, and `dev/local-runtime/`.
- Added `www/` migration map for safe browser-served application movement planning.
- Added local route-root compatibility toggle documentation for future `www/` activation.
- Moved browser-served application files under `www/` and made local static serving prefer `www/` by default.
- Moved server/API application runtime under `api/`; browser API clients remain outside `api/`.
- Moved developer-only local runtime/bootstrap entrypoints under `dev/local-runtime/` and preserved the public npm command surface.
- Finalized moved test and validation path assumptions for the `www/`, `api/`, and `dev/local-runtime/` layout.
- Updated CI, package scripts, and developer utilities for the `www/`, `api/`, and `dev/` layout.
- Removed active references to obsolete legacy layout paths after the `www/`, `api/`, and `dev/` migration steps.
- Moved the tracked browser-served favicon under `www/`, added remaining root/src audit governance, and documented root `.env` placement policy.
- Added root leftover audit and `src/` transition plan for the final repository layout cleanup stage.
- Codex must read this version file and the latest repository copy of `PROJECT_INSTRUCTIONS.md` before performing work.
- Codex must discard previously remembered Project Instructions and treat the repository copy as authoritative.
- Codex must validate canonical report and ZIP paths, branching model, and legacy path avoidance before work proceeds.
