# Codex Commands — BUILD_PR_LEVEL_10_6P_COMPLETE_TOOL_UI_READINESS_DOD

## Model
GPT-5.4

## Reasoning
high

## Command

```powershell
codex --model gpt-5.4 --reasoning high "Execute BUILD_PR_LEVEL_10_6P_COMPLETE_TOOL_UI_READINESS_DOD. Read docs/dev/dod/tool_ui_readiness_dod.md. Inspect the current repo tools opened from games/index.html, samples/index.html, Workspace Manager, and sample/game manifests. Do not make broad implementation fixes. First validate whether the DoD misses any required input fields, output fields, UI controls, control-to-data bindings, ready states, error/empty states, or lifecycle/timer reset checks. If anything is missing, update docs/dev/dod/tool_ui_readiness_dod.md in place. Create docs/dev/reports/level_10_6p_tool_ui_readiness_dod_gap_report.md with per-tool findings and explicit yes/no answers. Run npm run test:launch-smoke:games and npm run test:sample-standalone:data-flow if available. Place final ZIP at tmp/BUILD_PR_LEVEL_10_6P_COMPLETE_TOOL_UI_READINESS_DOD.zip."
```
