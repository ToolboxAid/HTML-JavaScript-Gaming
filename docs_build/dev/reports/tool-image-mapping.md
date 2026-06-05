# Tool Image Mapping

## Mapping Summary

- Registry entries mapped: 41.
- Existing no-size-suffix images are used where present.
- No images were generated.
- No image files were renamed.
- `achievements` maps to existing singular artwork files `achievement.png` where present.
- `animations` uses existing `badges/animations.png` and existing `tools/animation.png`.
- Missing no-size-suffix artwork falls back through registry helpers at runtime and is reported below.
- Stale local Toolbox placeholder image fields were removed from `toolbox/tools-page-accordions.js` so registry data is the active image source.

## Missing Artwork

- sprites (Sprites): badge missing, tool exists
- music (Music): badge missing, tool exists
- videos (Videos): badge missing, tool exists
- saved-data (Saved Data): badge missing, tool exists
- performance (Performance): badge missing, tool exists
- publish (Publish): badge missing, tool exists
- ratings (Ratings): badge missing, tool exists
- midi (MIDI): badge missing, tool exists
- particles (Particles): badge missing, tool exists
- speech-to-text (Voice Capture): badge missing, tool exists
- text-to-speech (Voice Output): badge missing, tool missing
- users (Users): badge missing, tool exists
- platform-settings (Platform Settings): badge missing, tool exists

## Path Rules

- Badge root: `/assets/theme-v2/images/badges/`.
- Tool root: `/assets/theme-v2/images/tools/`.
- Banned size suffixes are not used in registry image fields.
- Existing suffixed files, such as `*-1024.png`, were not referenced by the registry.

## Validation Notes

- `node --check toolbox/toolRegistry.js` - PASS
- `node --check toolbox/tools-page-accordions.js` - PASS
- `node --check assets/theme-v2/js/tool-display-mode.js` - PASS
- `node --check scripts/run-targeted-test-lanes.mjs` - PASS
- `node --check tests/playwright/tools/ToolImageRegistry.spec.mjs` - PASS
- `npm run test:lane:tool-images` - PASS, 4 Playwright tests
- `git diff --check` - PASS

## Manual Test Notes

- Open `toolbox/index.html?role=admin` and confirm Toolbox cards render preview images and badges without 404s.
- Open `toolbox/project-workspace/index.html`, `toolbox/game-design/index.html`, `toolbox/game-configuration/index.html`, and `toolbox/build-game/index.html` and confirm Tool Display Mode badge/tool images render without console errors.
- Confirm any missing artwork uses the shared `image-missing.svg` fallback instead of a broken image request.
