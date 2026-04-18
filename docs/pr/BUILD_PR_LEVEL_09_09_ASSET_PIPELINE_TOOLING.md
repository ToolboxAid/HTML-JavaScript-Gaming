# BUILD_PR — LEVEL 09_09 — ASSET PIPELINE TOOLING

## Objective
Finish the next dependency-ordered asset/tooling lane by introducing a shared asset pipeline surface under `tools/shared` that converts validated tool-authored data into clean runtime-facing asset outputs.

This PR follows and depends on:
- 09_04 asset structure simplification
- 09_05 shared asset handoff enforcement
- 09_06 tool launch contract alignment
- 09_07 tool boundary normalization
- 09_08 tool data contracts

09_08 established explicit shared tool data contracts and validation. 09_09 now uses those contracts to define and implement the shared pipeline layer that performs load → validate → normalize → emit for runtime assets.

## Why This PR Exists
The repo now has:
- cleaner asset ownership
- shared handoff enforcement
- normalized tool boundaries
- contractable tool data

What is still missing is the actual shared pipeline layer that turns authoring data into deterministic runtime outputs.

Without this PR:
- each tool may evolve its own export logic
- normalization may drift across tools
- runtime asset emission remains inconsistent
- contract enforcement exists, but output flow is still fragmented

## Core Principle
Tools author data.
The shared pipeline validates and transforms data.
Games consume clean runtime assets.

## In Scope
- define a shared asset pipeline surface under `tools/shared`
- centralize pipeline stages for tool-authored asset processing
- use the 09_08 data contracts as the validation gate
- normalize authoring data before runtime emission
- define or implement shared emit behavior for runtime-facing assets
- add focused pipeline validation/tests
- document the runtime-vs-tool-data handoff pattern

## Out of Scope
- no engine changes
- no gameplay/runtime feature work
- no UI redesign
- no broad asset moves
- no speculative multi-format expansion beyond the active tool lane
- no production build system work outside the shared tool pipeline boundary

## Architectural Target
Preferred shared structure:
- `tools/shared/pipeline/`
- `tools/shared/pipeline/loaders/`
- `tools/shared/pipeline/normalizers/`
- `tools/shared/pipeline/emitters/`
- `tools/shared/pipeline/contracts/` (only if needed as a pipeline-facing layer)
- `tools/shared/pipeline/validation/` (only if needed by the pipeline surface)

Exact names may vary, but the pipeline must remain clearly separated from:
- tool UI code
- game runtime code
- engine code

## Required Pipeline Responsibilities
The shared pipeline should support a clean staged flow:

1. Load
- load tool-authored data from domain-specific tool/data locations
- resolve references deterministically
- avoid tool-to-tool coupling

2. Validate
- run data-contract enforcement from the shared contract layer
- stop or flag invalid inputs before emission

3. Normalize
- sanitize shared fields
- align naming/shape rules
- produce deterministic runtime-ready structures
- keep normalization centralized, not per-tool scattered

4. Emit
- produce runtime-facing outputs in the domain folder
- preserve the runtime vs authoring split:
  - runtime asset in `assets/<domain>/`
  - authoring/tool data in `assets/<domain>/data/`

## Required Data Ownership Pattern
This PR should align to the approved structure:

- root game coordinator/manifest at `games/<game>/assets/<game>.assets.json`
- runtime assets in `games/<game>/assets/<domain>/`
- tool/editor data in `games/<game>/assets/<domain>/data/`

Example:
- `sprites/ship.png`
- `sprites/data/ship.sprite.json`

The pipeline should be the shared boundary that understands this distinction.

## Active Domains To Support First
Prioritize the active tool lane only:
- sprites
- tilemaps
- parallax
- vectors

Support tilesets if directly required by active shared flow.

## Implementation Guidance
Keep this PR surgical and dependency-ordered:
- prefer exact-cluster extraction
- centralize export logic that is already repeated or clearly belongs in shared pipeline space
- do not pull UI/editor workflow code into the pipeline
- do not create a giant monolithic pipeline file if clean staged modules are warranted

## Validation Expectations
At minimum:
- touched pipeline/shared files parse cleanly
- pipeline uses the shared contract validation from 09_08
- invalid tool data is surfaced cleanly
- normalized output shape is deterministic
- runtime emission targets remain in domain folders, not `data/`
- existing launch-contract / asset integration checks are not regressed

## Acceptance Criteria
- a shared asset pipeline surface exists under `tools/shared`
- tool-authored data flows through shared contract validation before emit
- runtime vs tool-data separation is preserved
- active tool domains use consistent pipeline behavior
- no engine/runtime feature scope expansion occurs
- focused tests/checks pass

## Deliverables
Codex should return a repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_09_ASSET_PIPELINE_TOOLING.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_09_ASSET_PIPELINE_TOOLING.md
- docs/operations/dev/codex_commands.md
- docs/operations/dev/commit_comment.txt
- docs/operations/dev/next_command.txt
- docs/reports/change_summary.txt
- docs/reports/validation_checklist.txt
