MODEL: GPT-5.4
REASONING: high
COMMAND:
Implement BUILD_PR_LEVEL_12_15_SAMPLE_1319_RUNTIME_RETURN_TO_SERVER exactly as defined.

Required changes:
1. move:
   - samples/phase-13/1319/server/realNetworkServer.mjs
   - samples/phase-13/1319/server/realNetworkDashboard.mjs
   to:
   - samples/phase-13/1319/server/realNetworkServer.mjs
   - samples/phase-13/1319/server/realNetworkDashboard.mjs

2. update all references to the corrected sample-local server paths
3. remove samples/phase-13/1319/server/ if empty after the move
4. do not change logic or behavior

Validation required:
- no remaining references to samples/phase-13/1319/server/
- node samples/phase-13/1319/server/realNetworkServer.mjs boots
- dashboard endpoint loads
- node tmp/validate_1319.mjs passes
- samples/index.html still launches 1319

Update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md by changing status markers only.
Do not modify roadmap wording, structure, add content, or delete content.
