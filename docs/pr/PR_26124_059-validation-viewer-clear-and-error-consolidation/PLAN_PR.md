# PLAN_PR - PR_26124_059-validation-viewer-clear-and-error-consolidation

## Goal
Add a display-only Clear action to Palette Manager V2 Validation/Error Viewer and consolidate duplicate user swatch validation messages into a single line.

## Scope
- `tools/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Preserve existing validation behavior.
- Avoid broad refactor.

## Implementation Plan
1. Add a `Clear` button to the Validation/Error Viewer.
2. Wire `Clear` inside the validation viewer control so it only clears displayed messages.
3. Do not mutate Palette Manager validation state when clearing the viewer.
4. Consolidate duplicate user swatch validation output into one message.
5. Include only duplicate fields that actually failed: symbol, name, RGB/hex.
6. Preserve duplicate validation checks for add, update, individual pin, and Pin All.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by the Palette Manager V2-only validation viewer update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Trigger a duplicate user swatch validation failure where symbol, name, and RGB/hex duplicate.
3. Confirm the Validation/Error Viewer shows one consolidated duplicate line.
4. Click `Clear` and confirm the visible status/error messages are removed.
5. Trigger another validation message and confirm the viewer displays new messages again.
