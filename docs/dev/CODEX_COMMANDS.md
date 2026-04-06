MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ENHANCEMENTS

Requirements:
- Follow PLAN_PR + BUILD_PR + APPLY_PR discipline
- Build the zip automatically
- Docs-first
- No engine core changes
- One PR per purpose
- Keep implementation under tools/dev/server-dashboard
- Keep integration sample-level
- Extend the server dashboard foundation with:
  - player statistics view
  - latency view
  - rx bytes view
  - tx bytes view
  - connection/session counts
  - per-player status rows
  - refresh/update strategy
  - debug-only access rules
- Keep all data flow read-only
- Do not couple dashboard to console or overlay
- Write outputs under docs/pr and docs/dev/reports
- Put roadmap files under docs/roadmaps
- Package to <project folder>/tmp/BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ENHANCEMENTS_delta.zip
