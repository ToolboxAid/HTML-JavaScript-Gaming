# Tool Layout Width Validation Report

Stacked PR bundle:
- PR_26155_056-tool-layout-wide-all-tool-pages
- PR_26155_057-tool-layout-width-validation-report

## Checked Toolbox HTML Pages

Checked 43 `toolbox/**/*.html` pages:

- `dev/templates/tool-template-v2.html`
- `toolbox/achievements/index.html`
- `toolbox/ai-assistant/index.html`
- `toolbox/animations/index.html`
- `toolbox/assets/index.html`
- `toolbox/audio-effects/index.html`
- `toolbox/audio/index.html`
- `toolbox/build-game/index.html`
- `toolbox/characters/index.html`
- `toolbox/cloud/index.html`
- `toolbox/code/index.html`
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
- `toolbox/index.html`
- `toolbox/languages/index.html`
- `toolbox/marketplace/index.html`
- `toolbox/midi/index.html`
- `toolbox/music/index.html`
- `toolbox/objects/index.html`
- `toolbox/particles/index.html`
- `toolbox/performance/index.html`
- `toolbox/platform-settings/index.html`
- `toolbox/project-workspace/index.html`
- `toolbox/publish/index.html`
- `toolbox/ratings/index.html`
- `toolbox/saved-data/index.html`
- `toolbox/speech-to-text/index.html`
- `toolbox/sprites/index.html`
- `toolbox/text-to-speech/index.html`
- `toolbox/users/index.html`
- `toolbox/videos/index.html`
- `toolbox/voices/index.html`
- `toolbox/worlds/index.html`

## Pages Updated

Updated active Toolbox tool pages:

- `toolbox/achievements/index.html`
- `toolbox/ai-assistant/index.html`
- `toolbox/animations/index.html`
- `toolbox/assets/index.html`
- `toolbox/audio-effects/index.html`
- `toolbox/audio/index.html`
- `toolbox/build-game/index.html`
- `toolbox/characters/index.html`
- `toolbox/cloud/index.html`
- `toolbox/code/index.html`
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
- `toolbox/midi/index.html`
- `toolbox/music/index.html`
- `toolbox/objects/index.html`
- `toolbox/particles/index.html`
- `toolbox/performance/index.html`
- `toolbox/platform-settings/index.html`
- `toolbox/publish/index.html`
- `toolbox/ratings/index.html`
- `toolbox/saved-data/index.html`
- `toolbox/speech-to-text/index.html`
- `toolbox/sprites/index.html`
- `toolbox/text-to-speech/index.html`
- `toolbox/users/index.html`
- `toolbox/videos/index.html`
- `toolbox/voices/index.html`
- `toolbox/worlds/index.html`

Updated template source:

- `dev/templates/tool-template-v2.html`

Already compliant before this PR:

- `toolbox/project-workspace/index.html`

## Skipped Pages

- `toolbox/index.html`: skipped because it is the Toolbox listing/index surface and does not contain a `tool-workspace` shell.

## Validation Results

Automated audit:
- 43 Toolbox HTML pages checked.
- 42 pages contain a `tool-workspace` shell.
- All 42 tool-workspace shell pages now include `container--tool-wide` and `tool-workspace--wide`.
- No checked Toolbox HTML page contains page-local style blocks, inline style attributes, or inline script blocks.
- ToolDisplayMode badge and character image paths resolve for all Toolbox pages under the current helper rules.

Representative Playwright coverage:
- Create: `toolbox/objects/index.html`
- Build: `toolbox/game-design/index.html`
- Content: `toolbox/assets/index.html`
- Media: `toolbox/audio/index.html`
- Test: `toolbox/controls/index.html`
- Share: `toolbox/publish/index.html`
- Account: `toolbox/saved-data/index.html`

The representative pages all loaded with:
- Visible `.container--tool-wide`
- Visible `.tool-workspace--wide`
- Wide desktop container usage at 1440px
- Balanced side panels
- Dominant center panel
- No console errors
- No failed requests

Project Workspace is not the only visible wide-layout page. The representative Playwright test validates seven additional Toolbox pages across the current creator-facing groups.

## Commands Run

- `node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `npm run test:lane:project-workspace`
- `npm run test:workspace-v2`
- `git diff --check`

All final validation commands passed.
