# PR_26175_ALFA_001-toolbox-selected-game-status-bar Requirements Checklist

- PASS: `BUILD_PR.md` is the source of truth for this PR.
- PASS: Added shared toolbox status bar for toolbox pages.
- PASS: Status bar appears above footer in normal mode.
- PASS: Status bar anchors to bottom in fullscreen/tool display mode.
- PASS: Left side displays selected game from Game Hub.
- PASS: Center area displays tool messages and missing-game prompt.
- PASS: Game Hub owns selected game reads through the existing repository API.
- PASS: Selected game context is exposed globally as derived toolbox page context.
- PASS: Idea Board is excluded from selected-game filtering.
- PASS: Missing selected game shows a creator-safe prompt to select or create a game in Game Hub.
- PASS: API/service contract was preserved.
- PASS: Browser-owned product data is not used as selected-game source of truth.
- PASS: No silent selected-game fallback was added.
- PASS: No inline styles, style blocks, or page-local CSS were added.
- PASS: Theme V2 shared CSS/classes are used.
- PASS: Targeted Playwright coverage was added and passed.
