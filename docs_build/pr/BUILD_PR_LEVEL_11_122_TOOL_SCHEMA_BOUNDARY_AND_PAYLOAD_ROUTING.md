# BUILD_PR_LEVEL_11_122_TOOL_SCHEMA_BOUNDARY_AND_PAYLOAD_ROUTING

## Purpose
Correct the tool/schema boundary: each tool schema validates only that tool's direct JSON payload, while launchers/workspace/game routing are responsible for passing the correct tool JSON to the tool.

## Scope
- testable architecture cleanup
- schema boundary correction
- direct JSON contract refinement
- no schema lock yet
- no fallback/default/preset data
- no tool schema may validate parent game/workspace/sample documents

## Core Rule

A tool schema describes ONLY the JSON that tool consumes.

It must not know about:
- game schema
- workspace schema
- sample schema
- manifest wrapper schema
- launcher metadata schema
- parent document shape

## Correct Data Flow

### Sample launches tool

sample relationship -> explicit tool JSON file -> matching tool schema -> tool render

### Game launches Workspace Manager

game JSON -> game schema -> Workspace Manager

Workspace Manager may read the game JSON and route/pass the referenced tool JSON payload to a tool.

### Workspace Manager launches palette tool

game/workspace JSON -> Workspace Manager -> palette JSON -> palette-browser.schema.json -> Palette Browser

Palette Browser must receive palette JSON only.

## Palette Boundary Correction

The current `palette-browser.schema.json` allows wrapper/tool payload forms through `oneOf` and `$defs.toolPayload`.

That is too broad for the target boundary.

Palette Browser schema should expect only a palette payload.

Expected palette schema:
- `schema: "html-js-gaming.palette"`
- `version`
- `name`
- `swatches`

It should not require or accept:
- `tool`
- wrapper `payload`
- game schema JSON
- workspace schema JSON

## Required Changes

### 1. Tool schemas are pure

For each tool schema:
- remove parent/wrapper acceptance
- remove game/workspace/sample awareness
- remove `oneOf` that accepts wrapper and raw payload unless the tool itself truly consumes both as first-class input
- prefer one direct payload shape

### 2. Launcher/routing owns extraction

If launched from:
- sample
- game
- workspace manager

then launcher/routing code must pass the exact tool JSON input file/payload to the tool.

Do not make the tool schema accept the parent document just to make launch work.

### 3. Workspace Manager boundary

Workspace Manager may validate:
- game schema
- workspace schema

But child tools validate:
- only their own tool payload schema

### 4. Error behavior

If Workspace Manager cannot find/pass the correct tool JSON:
- show visible error
- do not pass parent JSON to the child tool
- do not fallback
- do not infer/normalize/convert

### 5. Palette Browser specific fix

Update `src/shared/schemas/tools/palette-browser.schema.json` so it validates only palette payload JSON.

Remove acceptance of:
- `{ tool, version, payload }`
- nested `payload`
- `oneOf` wrapper mode

Keep palette-only fields:
- `$schema` optional
- `schema`
- `version`
- `id` optional
- `name`
- `source` optional
- `sourceId` optional
- `locked` optional
- `swatches`

## Validation

Targeted validation only.

Required:
- palette JSON files validate against palette-only schema
- wrapper payload JSON no longer validates as palette-browser input
- game/workspace JSON no longer validates as palette-browser input
- workspace/game launch path passes tool JSON to child tools
- invalid/wrong parent JSON passed to a child tool shows visible schema error
- no fallback/default/preset data introduced

## Reports

Codex must write populated reports:

- `docs_build/dev/reports/tool_schema_boundary_11_122.txt`
- `docs_build/dev/reports/palette_schema_payload_only_11_122.txt`
- `docs_build/dev/reports/workspace_tool_payload_routing_11_122.txt`
- `docs_build/dev/reports/validation_after_11_122.txt`

Reports must include:
- tool schemas reviewed
- schemas changed
- wrapper acceptance removed
- routing/extraction paths checked
- validation evidence
- blockers if any

## Full Samples Smoke Test

Skipped.

Reason:
- targeted schema boundary/routing cleanup
- full samples smoke test takes approximately 20 minutes

## Acceptance

- tool schemas validate tool payloads only
- Palette Browser schema validates palette JSON only
- parent game/workspace/sample JSON is not accepted by child tool schemas
- routing passes the right JSON to the right tool
- schema-only validation remains the only validation gate
