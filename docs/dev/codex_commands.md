# Codex Commands — LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT

## Model
GPT-5.4

## Reasoning
high

## Command
```powershell
codex exec --model gpt-5.4 --reasoning high "Read docs/dev/PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md and docs/dev/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md. Implement the smallest scoped PR to close standalone sample/tool data-flow generic failures for Phase 10.6B. Do not add silent fallback data, hardcoded asset paths, new features, or repo-wide cleanup. Preserve sample -> schema -> normalized input -> tool -> UI/state. Run npm run test:launch-smoke:games and npm run test:sample-standalone:data-flow. Update docs/dev/reports/level_10_6b_standalone_generic_failure_closeout_report.md and docs/dev/reports/level_10_6b_tool_contract_matrix.md with validation-backed results."
```

## Validation
```powershell
npm run test:launch-smoke:games
npm run test:sample-standalone:data-flow
```
