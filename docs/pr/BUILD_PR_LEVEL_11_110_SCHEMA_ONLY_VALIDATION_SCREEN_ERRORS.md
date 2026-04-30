# BUILD_PR_LEVEL_11_110_SCHEMA_ONLY_VALIDATION_SCREEN_ERRORS

## Purpose
Enforce schema-only validation for tool JSON inputs and require visible on-screen errors when input does not match schema.

## Scope
- docs-first
- no implementation code
- direct JSON contract refinement
- no schema lock yet
- no feature expansion
- no fallback behavior

## Core Rule

The ONLY validation allowed is schema validation.

If the JSON does not match the schema, the tool must show an error on screen.

## Required Behavior

For every tool input load:

1. Load the explicitly referenced JSON file.
2. Validate it against the matching JSON schema.
3. If valid:
   - render the tool using the JSON as-is.
4. If invalid:
   - do not normalize
   - do not transform
   - do not convert
   - do not repair
   - do not infer missing fields
   - do not inject defaults
   - do not fallback to sample data
   - show a clear on-screen schema validation error.

## Error Display Requirement

Schema errors must be visible in the tool UI.

Minimum on-screen error must include:
- tool id/name
- JSON file/source path if available
- schema name/path if available
- validation failure summary
- failed field/path if available

## Disallowed Validation

Do not add custom validation rules outside the schema.

Disallowed:
- manual required-field checks outside schema
- special-case tool validation
- compatibility checks
- alias acceptance
- legacy shape detection
- runtime coercion
- runtime type conversion
- default substitution

If a rule is required, it belongs in the schema.

## Allowed Non-Schema Checks

Only these are allowed before schema validation:
- file exists
- JSON parses

If file is missing or JSON parse fails, show a clear on-screen error.

## Required Reports

Codex must write:

- docs/dev/reports/schema_only_validation_11_110.txt
- docs/dev/reports/screen_error_contract_11_110.txt
- docs/dev/reports/non_schema_validation_paths_11_110.txt

Reports must identify:
- validation paths changed
- remaining non-schema checks
- why any remaining check is allowed
- UI error locations updated

## Validation

Targeted validation only.

Required:
- valid JSON renders
- invalid schema JSON shows visible screen error
- no fallback/default/normalization path handles invalid JSON
- no custom validation remains in changed paths except file exists / JSON parse

## Full Samples Smoke Test

Skipped.

Reason:
- targeted validation-contract cleanup
- no broad sample smoke test unless shared loader behavior changes require it
- full samples smoke test takes approximately 20 minutes

## Acceptance

- Schema is the only validation gate.
- Invalid schema data produces visible screen errors.
- Tools do not repair invalid input.
- Missing file and JSON parse errors are visible.
- No new fallback/default behavior is introduced.
