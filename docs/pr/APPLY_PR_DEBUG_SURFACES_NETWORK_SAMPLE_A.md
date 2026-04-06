Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A.md

# APPLY_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A

## Apply Scope
Apply the approved Sample A implementation exactly:
- add `games/network_sample_a/` sample files
- wire fake telemetry into diagnostics context
- register Sample A debug plugin panels/providers/commands
- update docs and reports for Sample A status

## Validation Targets
- Sample opens from `games/network_sample_a/index.html`.
- Fake telemetry updates continuously.
- Overlay panels show connection, latency, and trace data.
- `network.status`, `network.latency`, and `network.trace` execute successfully.
- No engine core files are modified.

## Roadmap State Updates
Bracket-only status updates in `docs/dev/BIG_PICTURE_ROADMAP.md`:
- Connection status panel -> `[x]`
- Latency / RTT panel -> `[x]`
- Event tracing -> `[x]`

## Output
`<project folder>/tmp/PR_DEBUG_SURFACES_NETWORK_SAMPLE_A_FULL_bundle.zip`
