Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B.md

# APPLY_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B

## Apply Scope
Apply Sample B host/client diagnostics implementation exactly as built.

## In Scope Files
- `games/network_sample_b/index.html`
- `games/network_sample_b/main.js`
- `games/network_sample_b/game/FakeHostClientNetworkModel.js`
- `games/network_sample_b/game/NetworkSampleBScene.js`
- `games/network_sample_b/debug/networkSampleBDebug.js`
- `games/network_sample_b/assets/preview.svg`
- `games/index.html` (Level 11 card/list integration)
- `docs/pr/PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B.md`
- `docs/dev/NETWORK_SAMPLES_PLAN.md` (Track O bracket updates)
- docs/dev control/report files for this bundle

## Validation
- `node --check` passes for all new/changed Sample B JS files.
- Sample B debug plugin commands return structured output:
  - `network.connections`
  - `network.replication`
- Sample B card appears under Level 11 in `games/index.html` with Play/Debug links.
- Track O checklist is updated to `[x]`.
- `BIG_PICTURE_ROADMAP.md` remains unchanged unless explicitly validated and updated.

## Output
`<project folder>/tmp/PR_DEBUG_SURFACES_NETWORK_SAMPLE_B_FULL_bundle.zip`
