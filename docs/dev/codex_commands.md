# Codex Commands — BUILD_PR_LEVEL_10_6O_TOOL_UAT_FAILURE_STABILIZATION

## Model
GPT-5.3-codex

## Reasoning
high

## Command
```powershell
codex --model gpt-5.3-codex --reasoning high "Execute BUILD_PR_LEVEL_10_6O_TOOL_UAT_FAILURE_STABILIZATION exactly as described in docs/pr/BUILD_PR_LEVEL_10_6O_TOOL_UAT_FAILURE_STABILIZATION.md. Fix only the listed UAT failures. Before coding, inspect the owning files for accordion state, asset-browser/import-hub approved assets, tilemap studio load/control binding, vector asset studio palette/paint/stroke binding for samples 1215/1216/1217, and vector map editor failing samples while preserving 1212/1213/1214. Add diagnostics proving expected vs actual input and UI-control readiness. Do not introduce fallback/demo data or hardcoded paths. Run npm run test:launch-smoke:games and npm run test:sample-standalone:data-flow. Write docs/dev/reports/level_10_6o_tool_uat_failure_stabilization_report.md. Package changed files into tmp/BUILD_PR_LEVEL_10_6O_TOOL_UAT_FAILURE_STABILIZATION.zip." 
```
