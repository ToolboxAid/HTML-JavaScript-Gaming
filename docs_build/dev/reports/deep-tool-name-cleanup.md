# Deep Tool Name Cleanup

PR bundle:
- `PR_26155_019-admin-creator-view-banner`
- `PR_26155_020-deep-tool-name-cleanup`
- `PR_26155_021-toolbox-role-filter-wireframe`

## Summary

Updated active Toolbox names, routes, registry keys, header navigation, page titles, and active Playwright checks to the concise Toolbox vocabulary.

## Route And Folder Updates

Renamed active routes/folders:
- `toolbox/palette/` -> `toolbox/colors/`
- `toolbox/storage/` -> `toolbox/saved-data/`
- `toolbox/sound/` -> `toolbox/audio/`
- `toolbox/input/` -> `toolbox/controls/`
- `toolbox/animation/` -> `toolbox/animations/`
- `toolbox/object-vector/` -> `toolbox/objects/`
- `toolbox/world-vector/` -> `toolbox/worlds/`
- `toolbox/music-library/` -> `toolbox/music/`
- `toolbox/voice/` -> `toolbox/voices/`
- `toolbox/localization/` -> `toolbox/languages/`
- `toolbox/settings/` -> `toolbox/platform-settings/`
- `toolbox/sound-effects/` -> `toolbox/audio-effects/`

## Active Creator-Facing Labels

The active Toolbox renderer now uses:
- Project Workspace
- Game Design
- Game Configuration
- Assets
- Colors
- Fonts
- Sprites
- Characters
- Objects
- Worlds
- Animations
- Audio
- Music
- Voices
- Videos
- AI Assistant
- Build Game
- Game Testing
- Controls
- Hitboxes
- Saved Data
- Debug
- Performance
- Events
- Publish
- Marketplace
- Community
- Languages
- Achievements
- Ratings

Admin-only planned labels:
- Users
- Environments
- Game Migration
- Platform Settings

Hidden capability labels kept for admin/dev review only:
- Cloud
- Custom Extensions
- Creator Learning
- MIDI
- Particles
- Audio Effects
- Voice Capture
- Voice Output

## Cleanup Notes

- Active Toolbox renderer, shared header, shared route map, registry entries, current command notes, and active Playwright checks were updated.
- The product ID remains `GameFoundryStudio`.
- Historical prior reports outside this PR were not broadly rewritten; current stack reports avoid old user-facing tool labels except when documenting the route move itself.
- Arcade remains outside Toolbox.

## Validation Notes

Passed:
- `node --check assets/theme-v2/js/gamefoundry-partials.js`
- `node --check toolbox/tools-page-accordions.js`
- `node --check toolbox/toolRegistry.js`
- `node --check scripts/validate-active-tools-surface.mjs`
- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `node scripts/validate-active-tools-surface.mjs`
- `node scripts/validate-tool-registry.mjs`
- Focused active Toolbox vocabulary scan: only product-ID uses of the restricted word remain.
- `git diff --name-only -- '*.css'` returned no files.

Manual test notes:
- Open `/toolbox/index.html` and confirm final labels are visible.
- Confirm old creator-facing labels do not appear in Toolbox main content.
- Confirm Arcade does not appear in Toolbox main content.

Theme V2 gap findings:
- None. No new CSS was needed.
