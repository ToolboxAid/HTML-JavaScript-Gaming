Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A.md

# APPLY_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A

## Apply Scope
Apply the approved Sample A implementation only:
- add `games/network_sample_a` sample files
- integrate sample-owned fake network telemetry
- register sample-owned network debug panels/providers/commands
- update docs/dev controls and reports for this PR

## Roadmap Updates (Bracket-Only)
In `docs/archive/dev-ops/BIG_PICTURE_ROADMAP.md`:
- Connection status panel -> `[x]`
- Latency / RTT panel -> `[x]`
- Event tracing -> `[x]`

## Validation Targets
- sample opens and runs
- panel telemetry updates continuously
- command executions succeed
- no engine core changes

## Output
`<project folder>/tmp/PR_DEBUG_SURFACES_NETWORK_SAMPLE_A_FULL_bundle.zip`
