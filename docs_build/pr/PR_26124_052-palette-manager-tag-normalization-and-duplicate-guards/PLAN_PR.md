# PLAN_PR - PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards

## Goal
Normalize Palette Manager V2 tags to lowercase everywhere and add duplicate guards for user-defined swatch identity fields.

## Scope
- `tools/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not modify shared accordionV2.
- Preserve pin/unpin, sort, search, size, import/export, and tag roundtrip behavior.

## Implementation Plan
1. Force tag normalization to lowercase in Palette Manager V2 swatch utilities.
2. Ensure displayed, stored, imported, and exported tags use lowercase normalized values.
3. Add duplicate validation for User Defined/Add swatch `name`, `hex`, and `symbol`.
4. Block Add and Update when a duplicate is found, with clear validation/error messages.
5. Remove Source field from the Add accordion.
6. Remove Tags field from the Add accordion.
7. Allow clicking an existing tag in Selected Swatch to remove it from the selected swatch.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after Palette Manager V2-only changes.
- Expected fail behavior: failures identify Workspace V2 regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2 through a local server.
2. Add a tag with uppercase letters and confirm it displays/exports lowercase.
3. Import palette JSON with uppercase tags and confirm export emits lowercase tags.
4. Attempt to add duplicate user swatches by name, hex, and symbol and confirm Add is blocked.
5. Attempt to update a swatch into duplicate name, hex, and symbol and confirm Update is blocked.
6. Confirm Add accordion no longer has Source or Tags fields.
7. Click a tag inside Selected Swatch and confirm it is removed from the selected swatch.
