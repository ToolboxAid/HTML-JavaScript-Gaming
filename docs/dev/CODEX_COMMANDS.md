MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Follow PLAN_PR + BUILD_PR + APPLY_PR

Create APPLY_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ADVANCED

Requirements:
- Docs-first before implementation
- No engine core changes
- One PR per purpose
- Build zip automatically to <project folder>/tmp/
- Implement advanced shared server dashboard under engine/debug/network/dashboard
- Keep providers read-only
- No console coupling
- No overlay coupling
- No persistence
- Add:
  - serverDashboardViewModel.js
  - serverDashboardMetrics.js
  - serverDashboardRefreshModes.js
  - registerDashboardCommands.js
- Extend host/registry/renderer through public APIs only
- Validate imports, snapshot normalization, refresh modes, command outputs, and sample plugin parity
- Update roadmap trackers with bracket-only edits only
- Roadmaps live under docs/roadmaps/
