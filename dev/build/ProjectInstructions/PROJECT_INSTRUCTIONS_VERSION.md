# Project Instructions Version

Current Project Instructions Version: 2026.06.28.009

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
- Moved server/API application runtime under `api/`; browser API clients remain outside `api/` and developer-only bootstrap remains in `dev/` until the local-runtime migration PR.
- Codex must read this version file and the latest repository copy of `PROJECT_INSTRUCTIONS.md` before performing work.
- Codex must discard previously remembered Project Instructions and treat the repository copy as authoritative.
- Codex must validate canonical report and ZIP paths, branching model, and legacy path avoidance before work proceeds.
