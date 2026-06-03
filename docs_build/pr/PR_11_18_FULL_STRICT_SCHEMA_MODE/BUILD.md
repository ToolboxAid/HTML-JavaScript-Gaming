# BUILD_PR_11_18_FULL_STRICT_SCHEMA_MODE

## Required Codex Work

### 1. Enforce strict mode globally
Scan all JSON schemas under:
`tools/schemas/`

For every schema object with `"type": "object"`:
- add `"additionalProperties": false` if missing
- change `"additionalProperties": true` to false
- explicitly list every allowed property under `properties`

### 2. Complete incomplete schemas
Do not hide unknown fields by leaving schemas loose.
If existing payloads need fields:
- add those fields explicitly
- define type and required behavior
- add nested object schemas with `additionalProperties: false`

### 3. Workspace schema rules
Workspace must be strict:
- no top-level extra properties
- `tools.additionalProperties: false`
- `tools.palette-browser` required and singular
- tool payloads referenced via `$ref`
- all supported tool keys explicitly listed

### 4. Tool schema rules
Each tool schema must be strict:
- root object additionalProperties false
- nested objects additionalProperties false
- arrays must define item schemas
- metadata/config/style/editorOptions must be explicit objects, not loose catchalls

### 5. Validation
Add/run validation that proves:
- all schemas parse
- all `$ref` targets resolve
- no schema object has missing additionalProperties
- no schema has additionalProperties true
- unknown field injection fails
- sample 1902 validates
- sample 1902 Workspace shows all intended tools

### 6. Validation report
Create:
docs_build/dev/reports/PR_11_18_FULL_STRICT_SCHEMA_MODE_report.md

Report must include:
- schemas changed
- count of `additionalProperties` changed from true to false
- count of object schemas fixed where property was missing
- fields explicitly added
- unknown-field rejection test result
- sample 1902 validation result
- Workspace 1902 tool list validation
- confirmation no start_of_day changes

## Constraints
- One PR purpose only: strict schema mode.
- No broad UI changes.
- No fallback/default/hidden data.
- No loosening schemas to make validation pass.
- Do not modify unrelated samples.
