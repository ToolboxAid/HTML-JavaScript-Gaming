# PR_26126_088 Asset Manager V2 Undo Redo Behavior Notes

Date: 2026-05-06

## Behavior

- Asset Manager V2 now tracks local asset-state history for add, delete, and update operations.
- Undo restores the previous validated asset map and selected asset.
- Redo reapplies the undone validated asset map and selected asset.
- Undo and Redo update:
  - Assets display
  - Output Summary
  - Status
  - Asset Controls history button state
- New add, delete, or update operations clear the redo stack.

## Edit Operation

- Selecting an asset tile loads its `id`, `kind`, `role`, and `path` into Asset Controls.
- Update Asset validates the edited entry through the same schema validator used by Add.
- Renaming an ID during update is allowed only when the target ID is not already present.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates Update Asset by changing an audio asset path.
- Playwright validates Undo restores the previous path and Redo reapplies the updated path.
- Playwright validates deleting an image asset, Undo restoring it, and Redo deleting it again.

