# BUILD_PR_LEVEL_10_6P_COMPLETE_TOOL_UI_READINESS_DOD

## Purpose
Complete the Tool UI Readiness DoD before continuing UAT stabilization.

## Scope
- Add a complete per-tool UI Readiness Definition of Done.
- Require Codex to inspect current tools and identify missing fields/controls/checks.
- Require the DoD to be updated if Codex finds gaps.
- Do not implement broad runtime fixes in this PR unless needed only to validate/report DoD coverage.

## Non-goals
- No unrelated implementation refactor.
- No start_of_day changes.
- No silent fallback data.
- No hardcoded asset paths.
- No roadmap rewrite.

## Acceptance
- `docs/dev/dod/tool_ui_readiness_dod.md` exists and covers all current tool classes.
- `docs/dev/reports/level_10_6p_tool_ui_readiness_dod_gap_report.md` is created by Codex.
- Report explicitly answers whether any fields/controls/readiness checks were missed.
- Roadmap update, if any, is status-only.
