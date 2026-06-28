# Project Instructions Version

Current Project Instructions Version: 2026.06.28.004

Last Updated: 2026-06-28

## Breaking Changes Summary

- Codex startup validation is mandatory before every task outcome.
- Project Instructions versions are repository-owned and increment independently of PR numbers.
- Added dedicated branching policy document.
- Startup validation now verifies the branching policy document was loaded instead of duplicating policy text.
- Added backlog startup assignment policy requiring `BACKLOG_MASTER.md` and Tool Votes/Admin Owner priority signal review during team startup.
- Added proposed repository layout architecture plan for future `www/`, `api/`, and `dev/` separation.
- Codex must read this version file and the latest repository copy of `PROJECT_INSTRUCTIONS.md` before performing work.
- Codex must discard previously remembered Project Instructions and treat the repository copy as authoritative.
- Codex must validate canonical report and ZIP paths, branching model, and legacy path avoidance before work proceeds.
