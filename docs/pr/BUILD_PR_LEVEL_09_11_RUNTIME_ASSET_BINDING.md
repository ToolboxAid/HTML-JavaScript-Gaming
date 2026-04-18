# BUILD_PR — LEVEL 09_11 — RUNTIME ASSET BINDING

## Objective
Finish the next dependency-ordered step after game asset manifest coordination by binding runtime consumers to the deterministic game asset manifest and shared emitted asset records, without allowing runtime code to read tool/editor-only data.

This PR follows:
- 09_09 asset pipeline tooling
- 09_10 game asset manifest coordination

09_10 established deterministic manifest generation at `games/<game>/assets/<game>.assets.json`.
09_11 now binds runtime-facing asset lookup to that manifest so games consume one clean coordinated surface.

## Why This PR Exists
The repo now has:
- shared pipeline stages
- data contract enforcement
- deterministic manifest coordination

What still needs to be finished is the runtime-facing binding layer that:
- resolves runtime assets from the coordinated manifest
- keeps runtime code out of `assets/<domain>/data/`
- centralizes manifest-based asset lookup instead of ad hoc path usage

Without this PR:
- games may keep directly referencing asset paths inconsistently
- manifest coordination exists but is not yet the standard runtime lookup surface
- runtime/tool-data separation can still be bypassed

## In Scope
- define a runtime-facing asset binding layer
- consume the deterministic game asset manifest as the approved lookup source
- centralize runtime asset resolution by asset/domain identifiers
- explicitly block editor/tool-data paths from runtime binding
- add focused tests for manifest-based runtime binding behavior
- keep the implementation within repo architecture boundaries

## Out of Scope
- no tool UI redesign
- no engine feature expansion
- no gameplay feature work
- no new asset formats
- no broad asset moves
- no changes that let runtime depend on tool/editor data

## Architectural Target
Preferred shape:
- shared runtime-safe asset binding utilities
- manifest-driven lookup helpers
- clear boundary between:
  - runtime asset resolution
  - editor-only/tool data

This may live in a runtime-safe shared location appropriate to the current repo structure, but must not weaken the tool/runtime separation.

## Required Responsibilities
1. Read runtime-facing records from `games/<game>/assets/<game>.assets.json`
2. Resolve runtime asset references deterministically
3. Prevent `/data/` records from being treated as runtime assets
4. Support active domains first:
- sprites
- tilemaps
- parallax
- vectors
- tilesets only if directly required
5. Keep lookup semantics stable enough for future migration/refactor work

## Validation Expectations
At minimum:
- touched files parse cleanly
- runtime binding resolves manifest-backed records correctly
- `/data/` paths are rejected or excluded from runtime binding
- deterministic lookup works by asset/domain identifiers
- existing manifest coordination and pipeline tests still pass

## Acceptance Criteria
- runtime asset binding uses the coordinated manifest
- runtime code no longer needs ad hoc per-domain path assumptions where touched
- tool/editor data remains excluded from runtime binding
- active domains resolve consistently
- focused tests/checks pass
- no unrelated engine/gameplay expansion occurs

## Deliverables
Return a repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_11_RUNTIME_ASSET_BINDING.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_11_RUNTIME_ASSET_BINDING.md
- docs/operations/dev/codex_commands.md
- docs/operations/dev/commit_comment.txt
- docs/operations/dev/next_command.txt
- docs/reports/change_summary.txt
- docs/reports/validation_checklist.txt
