# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

## PR
BUILD_PR_LEVEL_11_110_SCHEMA_ONLY_VALIDATION_SCREEN_ERRORS

## Execute

1. Extend the PR 11.109 direct JSON contract:
   - JSON is loaded directly.
   - The only validation is schema validation.
   - Invalid data must show a visible screen error.

2. Inspect tool input/loading paths only.

3. Remove or bypass custom validation outside schema validation, except:
   - file exists
   - JSON parse

4. Ensure every schema validation failure renders a clear UI error.

5. Error must include when available:
   - tool id/name
   - JSON source path
   - schema path/name
   - failed field/path
   - validation summary

6. Do not:
   - normalize
   - transform
   - convert
   - repair
   - infer
   - inject defaults
   - fallback to sample/demo data
   - accept aliases
   - add custom validation rules outside schema

7. If a validation rule is needed, put it in schema, not runtime code.

8. Preserve compact primitive-array formatting.

9. Validate targeted cases:
   - valid JSON input renders
   - invalid schema JSON shows screen error
   - missing file shows screen error
   - malformed JSON shows screen error
   - invalid JSON does not fallback to defaults

10. Write reports:
   - docs/dev/reports/schema_only_validation_11_110.txt
   - docs/dev/reports/screen_error_contract_11_110.txt
   - docs/dev/reports/non_schema_validation_paths_11_110.txt

11. Roadmap:
   - status-only update if execution-backed
   - do not rewrite roadmap text
   - do not delete roadmap text

12. Package Codex output ZIP at:
   tmp/PR_11_110_SCHEMA_ONLY_VALIDATION_SCREEN_ERRORS.zip
