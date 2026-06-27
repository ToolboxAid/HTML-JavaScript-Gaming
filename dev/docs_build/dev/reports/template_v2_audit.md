# Template V2 Audit

PR: `PR_26144_003-audit-template-v2-and-align-audio-sfx-css`

## Target Resolution

The request named `toolbox/_template_v2`. The repo contains `toolbox/_tool_template-v2`, so this audit used `toolbox/_tool_template-v2` as the intended Tool Template V2 folder.

## Findings Before

- `toolbox/_tool_template-v2/starter-project-template/config/starter.project.json` used an old project/workspace-shaped payload instead of the current game manifest contract.
- The old starter project JSON embedded Asteroids-specific sprite IDs and `games/Asteroids/game.manifest.json` references.
- `toolbox/_tool_template-v2/vector-native-arcade/config/template.project.json` pointed at `games/Asteroids/main.js#bootAsteroids`.
- `toolbox/_tool_template-v2/vector-native-arcade/runtime/bootstrap.runtime.json` pointed at `games/Asteroids/main.js` and `bootAsteroids`.
- `toolbox/audio-sfx-playground-v2` still contained copied template support files that were not used by the SFX tool runtime.
- `toolbox/audio-sfx-playground-v2/index.html` used a custom `audioSfxPlaygroundV2.css` stylesheet.

## Changes Made

- Replaced the old starter project JSON with `toolbox/_tool_template-v2/starter-project-template/config/starter.game.manifest.json`.
- Removed Asteroids references from `toolbox/_tool_template-v2`.
- Removed `toolbox/_tool_template-v2/vector-native-arcade/runtime/bootstrap.runtime.json` because it was game-specific and not usable as a neutral template runtime contract.
- Updated template docs to describe the current minimal game manifest starter.
- Added reusable range, toggle, meter, and preview tag styling to `toolbox/_tool_template-v2/styles/toolStarter.css`.
- Updated Audio / SFX Playground V2 to load `../_tool_template-v2/styles/toolStarter.css`.
- Removed the audio tool's custom CSS file and unused copied starter/template support files.

## Findings After

- `rg "Asteroids|asteroids|games/Asteroids|bootAsteroids" toolbox/_tool_template-v2 toolbox/audio-sfx-playground-v2` returned no matches.
- `toolbox/_tool_template-v2/starter-project-template/config/starter.game.manifest.json` validates through Workspace Manager V2 `validateGameManifest`.
- Audio / SFX Playground V2 now renders on the Tool Template V2 CSS class pattern while preserving Workspace V2 launch aliases used by existing Playwright coverage.

## Full Samples Smoke Test

Skipped. This change is limited to template/tool CSS alignment and does not broadly impact samples.
