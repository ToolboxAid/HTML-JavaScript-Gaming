# Placeholder

Codex must replace this file during execution.
# Recovery File Risk List From 20.1 Baseline

## Summary
- Baseline: `3f7e9df`
- HEAD: `5e5e5f12`
- Net scope: `488` files changed
- Risk model:
  - **Critical**: launch-routing and workspace-state core files
  - **High**: broad cross-lane churn and policy-sensitive paths
  - **Medium**: large content/doc additions not needed for immediate recovery
  - **Low**: formatting hygiene findings

## Critical Risk Files
- `games/index.render.js`
  - Risk: game tile/title/workspace routing behavior changed repeatedly.
- `samples/index.render.js`
  - Risk: sample tool launch generation and roundtrip behavior changed repeatedly.
- `tools/Workspace Manager/main.js`
  - Risk: host-mode query propagation and launch filtering expanded significantly.
- `tools/shared/platformShell.js`
  - Risk: launch clearing/hydration logic and shared binding behavior changed across multiple commits.
- `tools/shared/toolLaunchSSoT.js` (added)
  - Risk: centralized launch behavior introduced late in sequence; requires independent validation.

## High Risk Policy/Boundary Files
- `docs/dev/start_of_day/codex/PROJECT_INSTRUCTIONS.lnk` (added)
  - Risk: start_of_day boundary touched.
- `docs/dev/roadmaps/MASTER_ROADMAP_SAMPLES2TOOLS.md` (added)
  - Risk: roadmap surface expansion outside narrow UAT recovery objective.
- `samples/metadata/samples.index.metadata.json`
  - Risk: very high churn and tool mapping density; impacts sample launch correctness.
- `games/metadata/games.index.metadata.json`
  - Risk: launch eligibility and workspace mapping can drift from runtime behavior.

## High Risk Churn Groups (Path Patterns)
- `samples/phase-*/**`
  - Risk: broad additive/deletive churn increases replay difficulty and regression risk.
- `tools/*/index.html`
  - Risk: 8 tool index files changed/added/renamed; launch and UI behavior intertwined.
- `tools/*/main.js`
  - Risk: multiple tool runtime contracts changed outside isolated launch lane.
- `games/*/index.html` and `games/*/main.js`
  - Risk: workspace boot and game launch guard paths changed across many games.

## Medium Risk Files
- `docs/dev/reports/*` (large batch additions)
  - Risk: not runtime-critical but adds noise during recovery triage.
- `docs/pr/*` (multiple new PR/PLAN docs post-baseline)
  - Risk: can mislead replay scope if treated as authoritative implementation state.

## Low Risk Findings
- `git diff --check` newline-at-EOF warnings in:
  - `docs/dev/reports/BUILD_PR_LEVEL_20_2_WORKSPACE_MANAGER_GAMES_TILE_UAT_RECOVERY_uat_report.md`
  - `docs/dev/reports/tool_launch_ssot_external_memory_reset_validation.md`
  - `samples/phase-12/1208/data/toolFormattedTileMap.js`
  - `tools/shared/toolLaunchSSoT.js`

## Risk-Based Triage Recommendation
- Reset to baseline first.
- Reapply only launch-critical recovery in small PR slices:
  1. `games/index*` and `tools/Workspace Manager/main.js` routing only.
  2. `samples/index*` direct tool launch routing only.
  3. workspace memory-clear behavior only after explicit test confirmation.
- Defer all unrelated tool UI, sample content, and roadmap/document churn until after launch path stability is proven.
