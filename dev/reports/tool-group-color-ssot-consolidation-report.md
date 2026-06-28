# Tool Group Color SSoT Consolidation Report

PR: `PR_26156_126-tool-group-color-ssot-consolidation`

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Consolidated active Toolbox group color ownership so tool pages, Toolbox Group view, and shared Theme V2 color tokens use one registry-driven source of truth.
- Removed duplicate/alias color ownership from active tool pages and shared Theme V2 selectors.
- Did not modify archived V1/V2 pages.
- Did not modify `start_of_day`.
- Did not hardcode colors in tool pages.

## Source Of Truth

The surviving Toolbox group color classes are:

| Group class | Color model |
| --- | --- |
| `tool-group-ai` | Purple / AI |
| `tool-group-audio` | Orange / Audio |
| `tool-group-build` | Red / Build/Create |
| `tool-group-design` | Pink / Design |
| `tool-group-marketplace` | Gold / Marketplace |
| `tool-group-platform` | Blue / Platform |
| `tool-group-play` | Green / Play |

`toolbox/toolRegistry.js` now stores only these canonical classes in `colorGroup`.

`toolbox/tools-page-accordions.js` maps Toolbox Group view names to only these canonical classes.

`assets/theme-v2/css/colors.css` is the Theme V2 token owner for these classes.

## Removed Aliases And Duplicate Ownership

Removed or blocked from active usage:

- `tool-group-ai-learning`
- `tool-group-build-create`
- `tool-group-community-marketplace`
- `tool-group-content-assets`
- `tool-group-media-audio`
- `tool-group-media-audio-community`
- `tool-group-platform-cloud`
- `tool-group-dev-system`
- `tool-group-development-system`
- `tool-group-create`
- `tool-group-content`
- `tool-group-media`
- `tool-group-share`
- `tool-group-test`
- `tool-group-account`

Removed dead duplicate grouping CSS files:

- `assets/theme-v2/css/tools/grouping/ai-learning.css`
- `assets/theme-v2/css/tools/grouping/build-create.css`
- `assets/theme-v2/css/tools/grouping/community-marketplace.css`
- `assets/theme-v2/css/tools/grouping/content-assets.css`
- `assets/theme-v2/css/tools/grouping/development-system.css`
- `assets/theme-v2/css/tools/grouping/media-audio.css`
- `assets/theme-v2/css/tools/grouping/platform-cloud.css`
- `assets/theme-v2/css/tools/grouping/play.css`

`tool-group-media-audio-community` and `tool-group-dev-system` were requested aliases; no active Toolbox/Theme V2 runtime references remained, and they are now covered by the active test deny-list.

## Tools Corrected

| Tool | Previous active class | Corrected class |
| --- | --- | --- |
| Project Workspace | `tool-group-build-create` | `tool-group-build` |
| Game Configuration | `tool-group-build-create` | `tool-group-build` |
| Build Game | `tool-group-build-create` | `tool-group-build` |
| Custom Extensions | `tool-group-build-create` | `tool-group-build` |

Template corrected:

- `dev/templates/tool-template-v2.html`: `tool-group-ai-learning` -> `tool-group-ai`

## Tools Already Compliant

These active registry tool pages already used canonical SSoT group classes after the previous correction pass:

- Achievements
- AI Assistant
- Animations
- Assets
- Audio
- Audio Effects
- Characters
- Cloud
- Colors
- Community
- Controls
- Debug
- Environments
- Events
- Fonts
- Game Design
- Game Migration
- Game Testing
- Hitboxes
- Languages
- Marketplace
- MIDI
- Music
- Objects
- Particles
- Performance
- Platform Settings
- Publish
- Ratings
- Saved Data
- Sprites
- Users
- Videos
- Voices
- Voice Capture
- Voice Output
- Worlds

## Test Updates

- Updated `tests/playwright/tools/ToolsProgressHydration.spec.mjs` to expect `tool-group-build`.
- Updated `tests/playwright/tools/RootToolsFutureState.spec.mjs` to:
  - use the canonical seven-class SSoT list,
  - deny alias classes on active tool pages,
  - verify Toolbox Group view classes are canonical,
  - verify active tool page side columns match their registry `colorGroup`.

## Validation

Impacted lane: Tool UI color lane through the existing `tool-runtime` targeted lane.

Commands run:

- `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `node --check tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- `npm run test:lane:tool-runtime`
- `rg "tool-group-(build-create|ai-learning|media-audio-community|media-audio|content-assets|platform-cloud|dev-system|development-system|community-marketplace|create|content|media|share|test|account)" toolbox assets/theme-v2 -g "*.html" -g "*.js" -g "*.css"`
- Custom SSoT audit for all 41 active registry tool pages, `toolbox/tools-page-accordions.js`, and `assets/theme-v2/css/colors.css`
- `git diff --check`

Results:

- PASS: `npm run test:lane:tool-runtime`
- PASS: 5 Playwright tests passed.
- PASS: active alias scan found no Toolbox/Theme V2 active references.
- PASS: custom SSoT audit passed for 41 active registry tool pages and 7 canonical classes.
- PASS: `git diff --check`

Notes:

- A prior local lane attempt hit a transient resource request failure for `assets/theme-v2/css/buttons.css`; the file exists and the final rerun passed cleanly.
- Full samples smoke was skipped by request and because this PR does not affect samples.
- Broad lanes were skipped because the change is limited to Toolbox/Theme V2 group color ownership and targeted Tool UI color validation covers the affected behavior.
