MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.

INPUT CONTEXT:
Use the Level 10.6 delta result. It fixed targeted flows but reported 25 generic standalone data-flow failures.

NON-NEGOTIABLE RULES:
- Do not use silent fallback data.
- Do not add hardcoded asset paths.
- Do not mask invalid samples with defaults.
- Valid sample payload must explicitly reach the tool state/UI slot.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT.md.
3. Run or inspect `npm run test:sample-standalone:data-flow`.
4. Expand `tests/runtime/SampleStandaloneToolDataFlow.test.mjs` to include tool-specific contracts for all 25 generic failures.
5. Fix each listed sample/tool binding:
   - 3d-camera-path-editor: 0201,0202,0220
   - 3d-asset-viewer: 0204,1208,1413
   - physics-sandbox: 0210,0303,1606
   - tile-model-converter: 0221,0305,1209
   - 3d-json-payload-normalizer: 0221,0305,1208
   - parallax-editor: 0306,1204,1205,1208
   - performance-profiler: 0512,1319,1407
   - replay-visualizer: 0708,1315,1406
6. Fix root causes:
   - stale sample paths
   - wrong payload shape
   - missing required payload data
   - tool binding to wrong input slot
   - UI state not reflecting loaded payload
7. Re-run the standalone data-flow test until generic failure signals are zero, or document exact remaining blockers with file names.
8. Write reports:
   - docs/dev/reports/level_10_6b_standalone_generic_failure_closeout_report.md
   - docs/dev/reports/level_10_6b_tool_contract_matrix.md
9. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
   - [ ] -> [.]
   - [.] -> [x]
   - no prose rewrite/delete
10. Do not add runtime validators.
11. Do not modify start_of_day.
12. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT_delta.zip

ACCEPTANCE:
- generic failure signals after = 0, or exact remaining blocker report
- delta ZIP exists
