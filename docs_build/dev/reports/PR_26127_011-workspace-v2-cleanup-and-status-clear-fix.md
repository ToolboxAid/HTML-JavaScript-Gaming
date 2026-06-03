# PR_26127_011-workspace-v2-cleanup-and-status-clear-fix

## Summary
- Deleted deprecated `tools/workspace-v2` files and removed the empty directory from the working tree.
- Updated the Workspace V2 validation gate to run Workspace Manager V2 coverage only.
- Removed legacy Workspace V2 coverage/report registration.
- Removed the Workspace Manager V2 `Load Asteroids` menu control and action wiring.
- Fixed Status `Clear` so it clears only log content and does not toggle the accordion.
- Kept Workspace JSON copy button label as `copy`.
- Preserved Pong and Gravity Well manifest cleanup; `assets.image.background.preview` was not re-added.

## Validation
- PASS: `npm run test:workspace-v2`
- PASS: Confirmed `tools/workspace-v2` no longer exists.
- PASS: Confirmed no Playwright/package/tool references launch or validate deprecated `tools/workspace-v2`.
- PASS: Confirmed sample JSON files were not modified.
- SKIPPED: Full samples smoke test, per Workspace V2 cleanup scope.

## Notes
- `test:workspace-v2` now targets `tests/playwright/tools/WorkspaceManagerV2.spec.mjs` as the Workspace Manager V2 gate.
- Gravity Well and Pong manifest tests now assert the current single preview asset state and explicitly verify `assets.image.background.preview` remains absent.
- Status `Clear` now stops event propagation before clearing the log textarea, keeping the accordion expanded/collapsed state unchanged.
