# PR_26179_ALFA_010-tool-display-single-line-summary Manual Validation Notes

## Product Owner Checks

1. Open `/toolbox/game-design/index.html`.
2. Confirm the Tool Display Mode bar shows one direct line:
   - badge
   - Game Design name
   - character image
   - fullscreen icon on the far right
3. Confirm the old chevron, identity body, and Previous/Next navigation row are absent.
4. Click the fullscreen icon.
5. Confirm the icon changes to exit-fullscreen.
6. Confirm the badge remains 64x64 in fullscreen mode.
7. Confirm the character image is hidden in fullscreen mode.
8. Click the exit icon and confirm the normal view returns.

## Adjacent Checks

1. Open representative tools:
   - `/toolbox/game-hub/index.html`
   - `/toolbox/game-configuration/index.html`
   - `/toolbox/build-game/index.html`
2. Confirm each Tool Display Mode bar uses the registry-owned tool name, badge, and character image.
3. Confirm no visible Tool Display Mode Previous/Next controls appear.

## Notes

PR #198 remains historical validation input only. Its useful validation intent is represented by the current targeted Playwright coverage in this PR.
