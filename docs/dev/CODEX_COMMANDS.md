MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION

Requirements:
- Follow PLAN_PR + BUILD_PR + APPLY_PR discipline
- Docs-first for this bundle
- No engine core changes
- One PR per purpose
- Keep integration sample-level
- Implement docs for a read-only server dashboard foundation under tools/dev/server-dashboard
- Include host, registry, providers, renderer responsibilities
- Keep console and overlay decoupled from dashboard internals
- Keep combo keys unchanged
- Write outputs under docs/pr and docs/dev/reports
- Update tracker files only by changing bracket states
- Package to <project folder>/tmp/BUILD_PR_DEBUG_SURFACES_SERVER_DASHBOARD_FOUNDATION_delta.zip
