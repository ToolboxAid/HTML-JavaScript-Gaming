# PLAN_PR - PR_26124_049-palette-manager-swatch-tags-and-selected-layout

## Goal
Add optional swatch tags to Palette Manager V2 and the palette swatch schema, then split the left column into read-only Selected Swatch details and an editable User Defined Swatch form.

## Scope
- `toolbox/palette-manager-v2/*`
- `src/shared/schemas/tools/palette-browser.schema.json`
- Workflow docs_build/reports required by `docs_build/dev/PROJECT_INSTRUCTIONS.md`

## Boundaries
- Do not touch workspace/toolState/session logic.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not broaden changes beyond Palette Manager V2 and the palette swatch schema.
- Preserve accordionV2 behavior.
- Preserve pin/unpin, sort, search, size, import/export behavior.

## Implementation Plan
1. Update the palette swatch schema to allow optional `tags` as an array of non-empty strings while preserving required fields, `additionalProperties: false`, and six/eight-digit hex support.
2. Preserve tags through local swatch clone/validate/import/export behavior.
3. Split the left column into:
   - Selected Swatch accordion for selected details,
   - User Defined Swatch accordion for add/update/clear form actions.
4. Make Selected Swatch read-only for symbol, hex, name, and source while leaving tags editable.
5. Move Add User Swatch, Update Swatch, and Clear Form controls into User Defined Swatch.
6. Remove `Editing` from selected swatch titles and show only the color name.
7. Add local tag suggestions from tags already used in the active palette.
8. Validate with targeted syntax/browser checks and the requested Workspace V2 command.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after Palette Manager V2/schema changes.
- Expected fail behavior: failures identify Workspace V2 regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2 through a local server.
2. Confirm Selected Swatch and User Defined Swatch are separate left-column accordions.
3. Confirm Selected Swatch displays selected details and only tags are editable there.
4. Confirm User Defined Swatch contains Add User Swatch, Update Swatch, and Clear Form.
5. Add a swatch with tags and confirm tags roundtrip through export/import.
6. Confirm tag suggestions come from existing active-palette tags and still allow new manual tags.
7. Confirm source is displayed, preserved, and not editable from Selected Swatch.
