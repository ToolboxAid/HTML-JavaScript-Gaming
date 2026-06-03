# BUILD_PR_LEVEL_11_130_TOOL_INPUT_CONTRACT_WITH_PALETTE_DEPENDENCY

## Purpose
Extend the tool input contract to explicitly handle tools that require a palette, while preserving the direct JSON, schema-only, no-transform rules.

## Scope
- testable
- docs-first
- no implementation code
- no schema changes unless explicitly requested
- applies to all tools that may depend on a palette

## Core Rule (unchanged)

Tool must:
- receive direct JSON payload
- validate against its own schema
- render

Tool must NOT:
- accept wrapper {tool,payload}
- accept game/workspace JSON
- build input
- transform input
- fallback to defaults

## 🔷 Palette Dependency Caveat (MANDATORY)

If a tool requires a palette:

### Allowed
- Tool may receive:
  - its primary JSON payload
  - a reference to a palette JSON
- Routing layer (sample/workspace manager) may pass:
  - palette JSON as a separate input

### Required Rules
- Palette must be:
  - its own JSON file
  - validated by palette-browser.schema.json
- Tool must NOT:
  - embed palette data into its own payload
  - transform palette JSON
  - infer palette if missing
  - fallback to default palette

### Data Flow

tool payload JSON → tool schema validate  
palette JSON → palette schema validate  
tool uses palette JSON as-is

### Error Behavior

If palette is required but missing or invalid:
- show visible error
- do NOT:
  - inject default palette
  - attempt repair
  - convert parent JSON

## Validation

For tools with palette dependency:

Test:
1. valid payload + valid palette → PASS
2. valid payload + missing palette → FAIL
3. valid payload + invalid palette → FAIL
4. wrapper JSON → FAIL
5. parent JSON → FAIL

## Reports

docs_build/dev/reports/tool_palette_dependency_11_130.txt:
- tools requiring palette
- validation results
- violations found

## Acceptance

- palette dependency handled without breaking direct JSON contract
- palette remains independent JSON
- no fallback/default palette used
- no schema boundary violations introduced
