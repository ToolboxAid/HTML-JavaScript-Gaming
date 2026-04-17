MODEL: GPT-5.3-codex
REASONING: high

Execute BUILD_PR_LEVEL_19_24_ENGINE_TOOL_LEAK_REMEDIATION_GATE:

1. Read validation output from 19_23
2. If violations exist:
   - remove tool-specific dependencies from src/engine
   - relocate logic to tools or shared layers
   - preserve engine contracts
3. Re-run boundary validation
4. Output final report to docs/dev/reports
5. Produce ZIP artifact
