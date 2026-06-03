# PR_26127_013-status-header-order-and-preview-write-path-fix

## Summary
- Changed Asset Manager V2 Status header order from `Status Clear +` to `Status + Clear`.
- Replaced Preview Generator V2 workspace-launch download behavior with direct writes to the hydrated preview target URL path.
- Logged the workspace direct-write target before generation and logged the successful direct write path after PUT completion.
- Added explicit FAIL logging when the hydrated workspace write path is invalid, unavailable, or rejected by the server.
- Kept manual repo-folder launches on the existing File System Access write path.

## Validation
- PASS: `npm run test:workspace-v2`
- PASS: Workspace Manager V2 launch into Asset Manager V2 shows Status header order `Status + Clear`.
- PASS: Workspace Manager V2 launch into Preview Generator V2 with Pong keeps Generate Image enabled.
- PASS: Preview Generator V2 writes to `games/Pong/assets/images/preview.svg` through the hydrated workspace target path.
- PASS: Preview Generator V2 does not open a download/save flow for the valid hydrated workspace preview target.
- PASS: Direct write target is logged to Status.
- PASS: No deprecated `toolbox/workspace-v2` changes.
- PASS: No sample JSON changes.
- PASS: No game asset files were modified by validation.
- SKIPPED: Full samples smoke test, per Preview Generator write-path scope.

## Manual Validation Notes
- Open Workspace Manager V2.
- Select Pong.
- Launch Preview Generator V2 from the tool tile.
- Confirm Generate Image is enabled.
- Click Generate Image.
- Confirm Status logs `Workspace launch direct preview write target: games/Pong/assets/images/preview.svg.`
- Confirm Status logs `Direct preview write target: games/Pong/assets/images/preview.svg`.
- Confirm no browser save/download prompt appears for the hydrated workspace target.
- Open Asset Manager V2 through Workspace Manager V2 and confirm the Status header reads `Status + Clear`.
