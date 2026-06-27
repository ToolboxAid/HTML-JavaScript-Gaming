# PR_26156_123 Tool Center Image And Badge Cleanup Report

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- Removed placeholder `image-missing.svg` center-panel images from active registry-owned tool pages only.
- Updated shared Tool Display Mode badge styling under `assets/theme-v2/css/panels.css`.
- Updated targeted active tool page UI and Tool Display Mode Playwright/MSJ coverage.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.

## Active Tool Pages Cleaned

- `toolbox/achievements/index.html`
- `toolbox/animations/index.html`
- `toolbox/audio-effects/index.html`
- `toolbox/audio/index.html`
- `toolbox/build-game/index.html`
- `toolbox/characters/index.html`
- `toolbox/cloud/index.html`
- `toolbox/colors/index.html`
- `toolbox/community/index.html`
- `toolbox/controls/index.html`
- `toolbox/debug/index.html`
- `toolbox/environments/index.html`
- `toolbox/events/index.html`
- `toolbox/fonts/index.html`
- `toolbox/game-configuration/index.html`
- `toolbox/game-design/index.html`
- `toolbox/game-migration/index.html`
- `toolbox/game-testing/index.html`
- `toolbox/hitboxes/index.html`
- `toolbox/languages/index.html`
- `toolbox/marketplace/index.html`
- `toolbox/music/index.html`
- `toolbox/objects/index.html`
- `toolbox/performance/index.html`
- `toolbox/platform-settings/index.html`
- `toolbox/project-workspace/index.html`
- `toolbox/ratings/index.html`
- `toolbox/saved-data/index.html`
- `toolbox/speech-to-text/index.html`
- `toolbox/sprites/index.html`
- `toolbox/text-to-speech/index.html`
- `toolbox/users/index.html`
- `toolbox/videos/index.html`
- `toolbox/voices/index.html`
- `toolbox/worlds/index.html`

## Badge Cleanup

- Normal Tool Display Mode badge remains `64px` by `64px`.
- Fullscreen Tool Display Mode badge now renders at `32px` by `32px`.
- Badge uses `object-fit: contain` so the full square artwork displays.
- Removed the border, circular radius, and panel background that created a ring/crop treatment.

## Validation Notes

- Impacted lanes: `tool-runtime` and `tool-display-mode`.
- Ran `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`.
- Ran `node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`.
- Ran `node ./scripts/run-targeted-test-lanes.mjs --lane tool-runtime --lane tool-display-mode`.
- Ran a registry-driven static check confirming no active tool-center-panel placeholder images remain.
- Ran scoped `git diff --check` for changed implementation/test/report files.
- Ran changed-file static validation confirming no inline styles, style blocks, inline scripts, inline event handlers, archived V1/V2 paths, or `start_of_day` file changes were introduced.
- Full samples smoke: skipped by request.

## Manual Test Notes

- Verified by targeted Playwright that active tool pages still render `.tool-center-panel` and visible heading content after placeholder image removal.
- Verified by targeted Playwright that normal badge size is `64x64`.
- Verified by targeted Playwright that fullscreen badge size is `32x32`.
- Verified by targeted Playwright that badge border width and border radius are `0px`.
- Verified by targeted Playwright that badge artwork uses `object-fit: contain`.
- Verified no console errors or failed page requests in the selected lanes.
