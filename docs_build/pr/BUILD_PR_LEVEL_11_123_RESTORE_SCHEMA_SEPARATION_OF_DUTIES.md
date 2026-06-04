# BUILD_PR_LEVEL_11_123_RESTORE_SCHEMA_SEPARATION_OF_DUTIES

## Purpose
Restore strong separation of duties between workspace/game schemas and tool payload schemas after palette schema details were moved into `workspace.manifest.schema.json`.

## Scope
- testable cleanup PR
- schema boundary correction
- no schema lock yet
- no fallback/default/preset data
- no runtime conversion/normalization
- no broad unrelated refactor
- account for staged but uncommitted user changes

## Problem

Palette schema details appear to have been copied/moved into `workspace.manifest.schema.json`.

That is incorrect.

Workspace manifest must reference tool schemas. It must not inline or own palette/tool payload details.

## Core Rule

Schema ownership is separated by responsibility:

- game schema: validates game document
- workspace schema/manifest: validates workspace/tool references and routing structure
- tool schema: validates only that tool's direct JSON payload
- palette schema: validates palette JSON only

No parent schema should duplicate child tool payload internals.

## Required Revert / Restore

### 1. Workspace manifest must reference tool schemas

`workspace.manifest.schema.json` must use `$ref` for tool payload/schema contracts.

It must not inline palette payload structure:
- swatches
- palette symbols
- palette hex values
- palette names
- palette-specific nested payload logic

If palette details are present in workspace manifest:
- remove them
- restore `$ref` to `toolbox/palette-browser.schema.json`

### 2. Palette Browser schema owns palette details

`src/shared/schemas/tools/palette-browser.schema.json` must own:
- `schema: "html-js-gaming.palette"`
- `version`
- `id` optional
- `name`
- `source` optional
- `sourceId` optional
- `locked` optional
- `swatches`
- swatch shape

Palette Browser schema must not validate:
- game schema JSON
- workspace manifest JSON
- sample metadata JSON
- wrapper `{ tool, version, payload }` unless explicitly reverted by user later

### 3. All tools follow same pattern

Codex must review every tool schema and verify:

- each tool schema validates only that tool's direct JSON input
- no tool schema embeds parent game/workspace/sample schema
- no workspace/game/schema duplicates tool internals
- no tool requires preset data to work
- no tool input is normalized/transformed/converted before validation

### 4. Workspace Manager routing

Workspace Manager may receive:
- game schema JSON
- workspace schema JSON

Workspace Manager must:
- validate parent document with parent schema
- locate explicit tool payload references in the game/workspace JSON
- pass the exact referenced tool JSON payload/input to the child tool

Workspace Manager must not:
- convert payloads
- normalize payload shape
- transform game JSON into tool JSON
- wrap child payloads
- inline child schemas into workspace manifest
- infer missing tool input
- substitute fallback/default data

If the game/workspace JSON does not contain the needed tool payload/reference:
- show visible screen error
- do not fabricate or convert data

### 5. Staged changes handling

The user has staged changes but not committed.

Codex must:
- inspect staged diff first
- preserve correct staged changes
- revert staged changes that violate separation of duties
- do not discard unrelated staged work
- document all staged changes touched

## Tool Review Checklist

Codex must review all tool schemas under:

- `src/shared/schemas/tools/*.schema.json`

For each tool:
- schema accepts only direct tool payload JSON
- schema does not accept parent game/workspace/sample JSON
- schema does not inline unrelated tool schema
- schema has `additionalProperties: false`
- schema errors if wrong parent document is passed

## Routing Review Checklist

Codex must review Workspace Manager / launcher code paths for:
- game -> workspace manager
- workspace manager -> child tool
- sample -> tool

Confirm:
- parent validates as parent
- child validates as child payload only
- exact JSON is passed through
- no conversion layer
- no normalization layer
- no fallback/default injection

## Validation

Targeted validation only.

Required:
- changed JSON schemas parse
- schema refs resolve
- workspace manifest validates workspace structure only
- palette schema validates palette JSON only
- palette details are not in workspace manifest
- wrapper/game/workspace JSON fails palette-browser schema
- Workspace Manager routing passes referenced payload as-is
- staged changes remain clean and intentional

## Reports

Codex must write populated reports:

- `docs_build/dev/reports/schema_separation_revert_11_123.txt`
- `docs_build/dev/reports/tool_schema_payload_review_11_123.txt`
- `docs_build/dev/reports/workspace_payload_routing_review_11_123.txt`
- `docs_build/dev/reports/staged_changes_review_11_123.txt`
- `docs_build/dev/reports/validation_after_11_123.txt`

Reports must include:
- staged files inspected
- workspace manifest changes reverted/restored
- each tool schema reviewed
- routing paths reviewed
- validation commands/results
- blockers if any

No empty reports allowed.

## Full Samples Smoke Test

Skipped.

Reason:
- targeted schema/routing separation cleanup
- full samples smoke test takes approximately 20 minutes

## Acceptance

- workspace manifest references palette/tool schema; it does not inline palette details
- palette schema owns palette details
- every tool schema validates only that tool's JSON payload
- Workspace Manager passes child payloads as-is from game/workspace JSON
- no conversion/normalization/fallback is used to make tools work
- staged changes are preserved or reverted intentionally
