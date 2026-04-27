MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION.

NON-NEGOTIABLE RULES:
- Do not use silent fallback data.
- Do not add hardcoded asset paths.
- Do not hide invalid sample payloads by loading defaults.
- Valid sample data must be explicitly received and displayed by the target tool.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION.md.
3. Audit all sample payload files:
   - samples/**/sample.*.*.json
   - samples/**/sample.*.palette.json
4. Validate schema references and tool payload contracts.
5. Add/update an automated standalone sample tool data-flow test:
   - discover samples
   - open/route to target tool
   - verify data is received
   - verify UI/state displays expected data
6. Specifically fix/test:
   - sample 0204 -> Asset Browser / Import Hub Pipeline input
   - sample 1413 -> Asset Browser / Import Hub and/or Asset Pipeline Tool Pipeline input
   - sample 1505 -> Asset Browser / Import Hub Pipeline input
   - sample 0510 -> Asset Pipeline Tool Pipeline input
   - sample 1417 -> Asset Pipeline Tool Pipeline input
   - sample 0213 -> palette displays
   - sample 0308 -> palette displays
   - sample 0313 -> palette displays
7. Update tool standalone binding only where needed:
   - Asset Browser / Import Hub Pipeline input
   - Asset Pipeline Tool Pipeline input
   - Palette Browser palette display
8. Ensure no fallback/demo data is loaded.
9. Write reports:
   - docs/dev/reports/level_10_6_sample_schema_validation_report.md
   - docs/dev/reports/level_10_6_standalone_tool_data_flow_report.md
10. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
11. Do not add runtime validators.
12. Do not modify start_of_day.
13. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION_delta.zip

ACCEPTANCE:
- all targeted sample failures fixed or reported with exact blocker
- automated test catches standalone tool data-flow failures
- delta ZIP exists
