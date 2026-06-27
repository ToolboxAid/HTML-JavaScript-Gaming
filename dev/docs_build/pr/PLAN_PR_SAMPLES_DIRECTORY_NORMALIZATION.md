# PLAN_PR: Samples Directory Normalization

## Purpose
Define a docs-only, repo-wide normalization plan for sample paths using this exact contract:

`samples/phasexx/xxyy/index.html`

Where:
- `xx` = phase number
- `yy` = sample number

## Scope
Planning docs only.
No implementation code, no folder moves, no path rewrites, no runtime edits.

## Required Contract
- All sample entrypoints must normalize to `samples/phasexx/xxyy/index.html`.
- Remove spaces from directory names.
- Remove descriptive text from directory names.
- Preserve human-readable phase/sample text in index tiles and sample headers.
- Preserve behavior.

## Directory Rules
- Phase folder format: `phasexx`
- Sample folder format: `xxyy`
- No phase titles or descriptive labels in directory names.
- Human-readable names remain in UI text only.

## Deliverables in This Planning PR
1. PR plan (this file)
2. Mapping/report expectations
3. Validation checklist
4. Commit comment

## Future BUILD Strategy (No Execution Here)
1. Inventory all current sample entrypoints.
2. Generate one mapping table: old path -> normalized path.
3. Update `samples/index.html` links to normalized paths while preserving tile text.
4. Update sample headers so titles remain human-readable and independent of folder names.
5. Validate all normalized entrypoints and relative references.
6. Remove obsolete path exposure only after successful path validation.

## Mapping Requirements for BUILD
Each mapped row must include:
- old directory path
- new normalized path (`samples/phasexx/xxyy/`)
- phase number (`xx`)
- sample id (`xxyy`)
- index tile reference status
- header text preservation status
- validation status (pass/fail)

## Validation Requirements for BUILD
- Every sample launches from normalized path.
- No duplicate exposure between old and new links.
- No broken relative imports/assets from renamed paths.
- Human-readable phase/sample text remains visible in index tiles and sample headers.
- Behavior parity preserved.

## Out of Scope
- Gameplay changes
- Engine/shared refactors
- Tooling refactors unrelated to path normalization
- Any non-samples directory restructuring

## Fail-Fast Conditions
Stop the BUILD if any of the following occur:
- ambiguous phase/sample id mapping
- conflicting entrypoint ownership for the same `xxyy`
- unresolved relative-path breakage with no safe deterministic fix
- scope expansion beyond sample path normalization

## Acceptance Criteria for This PLAN
- Contract is explicit and unambiguous.
- Mapping/report expectations are documented.
- Validation checklist is documented.
- Commit comment is prepared.
- No implementation code changes were made.