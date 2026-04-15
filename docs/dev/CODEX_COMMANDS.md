MODEL: GPT-5.4
REASONING: high
COMMAND:
Implement BUILD_PR_LEVEL_12_13_SAMPLE_1319_ROOT_TESTS_AND_PS_RUNBOOK exactly as defined.

Required changes:
1. move executable runtime files:
   - tests/network-sample-1319/realNetworkServer.mjs
   - tests/network-sample-1319/realNetworkDashboard.mjs
   into:
   - tests/network-sample-1319/realNetworkServer.mjs
   - tests/network-sample-1319/realNetworkDashboard.mjs

2. keep samples/phase-13/1319/server/ for config/docs only
3. update all references from sample-local tests path to repo-level tests path
4. add a step-by-step PowerShell runbook for launching and validating sample 1319 from terminal
5. keep docker-compose under samples/phase-13/1319/server/docker-compose.yml
6. do not expand scope beyond relocation + runbook

Validation required:
- no remaining references to sample-local runtime .mjs paths
- node tests/network-sample-1319/realNetworkServer.mjs boots
- sample 1319 launches from samples/index.html
- dashboard loads and updates
- no regressions to launcher/sample pathing

Update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md by changing status markers only.
Do not modify roadmap wording, structure, add content, or delete content.
