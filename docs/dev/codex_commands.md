# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_121_VALIDATE_SSOT_TOOL_RELATIONSHIPS_LOAD_DIRECT_JSON

## Execute

1. Continue from PR 11.120 where hub counts match.

2. Use only this SSoT:
   - samples/metadata/samples.index.metadata.json

3. For every sample/tool relationship in the SSoT:
   - identify sample id
   - identify tool id
   - identify explicit JSON input path
   - identify schema path
   - verify JSON exists
   - verify JSON parses
   - verify JSON validates against schema
   - verify tool loading path uses JSON directly without fallback/default/preset

4. Fix deterministic issues:
   - path typo/casing
   - stale schema filename
   - stale canonical tool name
   - extra invalid fields
   - compact primitive-array formatting
   - obvious property-name mismatch

5. Remove relationship from SSoT when:
   - JSON input missing
   - real required data missing
   - tool needs defaults to render
   - relationship is unrelated to sample
   - intent is ambiguous

6. Do not:
   - add fake data
   - add fallback/default/preset data
   - normalize/transform/convert runtime data
   - reintroduce duplicate relationship sources

7. Validate after changes:
   - changed JSON parses
   - SSoT metadata validates
   - sample hub count matches SSoT
   - tools hub count matches SSoT
   - known-bad links remain absent
   - no second active source exists

8. Write populated reports:
   - docs/dev/reports/ssot_relationship_load_validation_11_121.txt
   - docs/dev/reports/relationships_fixed_11_121.txt
   - docs/dev/reports/relationships_removed_11_121.txt
   - docs/dev/reports/relationships_working_11_121.txt
   - docs/dev/reports/validation_after_11_121.txt

9. Reports must include final count.

10. Roadmap:
   - status-only update if execution-backed
   - do not rewrite roadmap text
   - do not delete roadmap text

11. Package Codex output ZIP at:
   tmp/PR_11_121_VALIDATE_SSOT_TOOL_RELATIONSHIPS_LOAD_DIRECT_JSON.zip
