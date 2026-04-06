Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD.md

# APPLY_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD

## Apply Scope
Apply the approved Track T implementation only.

## In Scope Files
- `games/network_sample_a/server/networkSampleADashboardServer.mjs`
- `games/network_sample_a/server/README.md`
- `docs/pr/PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD.md`
- `docs/dev/NETWORK_SAMPLES_PLAN.md` (Track T bracket updates)
- docs/dev controls/reports for this PR bundle

## Validation
- start dashboard server successfully
- authorized dashboard page loads
- authorized metrics endpoint returns JSON
- unauthorized request is rejected
- polling updates visible metrics
- Track T items in `NETWORK_SAMPLES_PLAN.md` moved to `[.]` or `[x]`
- `BIG_PICTURE_ROADMAP.md` unchanged

## Output
`<project folder>/tmp/PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD_FULL_bundle.zip`
