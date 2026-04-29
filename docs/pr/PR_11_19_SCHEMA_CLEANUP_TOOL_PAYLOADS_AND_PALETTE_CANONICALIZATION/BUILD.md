# BUILD_PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION

## Required Codex Work

### 1. Canonicalize Palette schema
Use:
`tools/schemas/tools/palette-browser.schema.json`

This is the only valid palette schema location/name.

Current uploaded palette-browser schema is too loose:
- `additionalProperties: true`
- generic `config`
- does not define swatches

Replace/merge it with the correct palette content from existing `tools/schemas/palette.schema*`.

Delete/remove all `tools/schemas/palette.schema*` files after migration.

Expected strict palette-browser payload:
- `tool`: const `palette-browser`
- `version`
- clear payload field, not loose config
- palette id/name/source/sourceId as needed
- swatches array
- each swatch explicitly defines symbol/hex/name or repo standard fields
- `additionalProperties: false` on every object

### 2. Remove broad sample wrapper validation from tool loading
Review:
`tools/schemas/sample.tool-payload.schema.json`

Goal:
- Tools should accept only tool JSON files.
- Extra objects/wrapper objects should not validate.
- If sample tooling still needs a wrapper schema, move it to a sample/test-specific role and do not use it as the tool payload schema.

Update tool launch/load validation so tool payloads `$ref` their actual tool schema.

### 3. Rename generic `config`
Across tool schemas, replace `config` with a clearer field.

Preferred field:
`payload`

Rationale:
- `config` is too vague.
- `payload` means the tool-owned document/data to render/edit.

If an existing repo standard is discovered, use it consistently and document the choice.

Update sample 1902 and validation fixtures as needed.

### 4. Make `gameId` generic
Replace tool/workspace schema fields that require `gameId` when the payload may represent a sample/tool/workspace.

Preferred:
- `projectId`

Allowed alternatives if already used consistently:
- `sourceId`
- `workspaceId`

Rules:
- Do not require `gameId` for generic tool payloads.
- If game-specific schemas need `gameId`, keep it only in game-specific schema sections.
- Sample 1902 must validate without pretending to be a game.

### 5. Workspace schema integration
Update Workspace manifest `$ref` targets to use:
- `tools/schemas/tools/palette-browser.schema.json`
- other tool schemas directly

Ensure:
- `tools.additionalProperties: false`
- all referenced tool schemas are strict
- unknown keys fail validation
- unknown fields inside payloads fail validation

### 6. Validation report
Create:
docs/dev/reports/PR_11_19_SCHEMA_CLEANUP_TOOL_PAYLOADS_AND_PALETTE_CANONICALIZATION_report.md

Report must include:
- palette schema files found
- palette schema files deleted
- final canonical palette schema path
- how `sample.tool-payload.schema.json` was handled
- chosen replacement for `config`
- chosen replacement for generic `gameId`
- schemas updated
- sample 1902 validation result
- unknown-field rejection result
- confirmation no other samples changed
- confirmation no start_of_day changes

## Constraints
- One PR purpose only.
- Do not loosen schemas to make validation pass.
- Do not keep duplicate palette schemas.
- Do not modify unrelated samples.
- No fallback/default/hidden data.
