# PR_26155_017 Planned Tool Shells

## Scope

- Added planned Toolbox shell pages from `dev/templates/tool-template-v2.html`.
- Preserved the copied template structure:
  - shared header partial
  - shared footer partial
  - ToolDisplayMode host
  - `tool-workspace` shell
  - left column
  - center panel
  - right column
  - Theme V2 CSS entry point
- Added no page-local CSS, tool-local CSS, inline styles, inline scripts, or real implementation logic.

## Planned Media & Audio Shells

- `toolbox/text-to-speech/index.html`
- `toolbox/speech-to-text/index.html`
- `toolbox/voice/index.html`
- `toolbox/sound-effects/index.html`
- `toolbox/music-library/index.html`

## Planned Support Shells

- `toolbox/fonts/index.html`
- `toolbox/settings/index.html`
- `toolbox/learn/index.html`
- `toolbox/marketplace/index.html`

## Wiring

- Added planned shells to the active Toolbox registry.
- Added planned shells to the shared Toolbox header navigation.
- Added planned shells to the shared partial route map.
- Added planned shells to the Toolbox index renderer.
- Kept Arcade out of Toolbox.

## Validation Notes

- PASS: `node --check assets/theme-v2/js/gamefoundry-partials.js`.
- PASS: `node --check toolbox/tools-page-accordions.js`.
- PASS: `node --check toolbox/toolRegistry.js`.
- PASS: `node --check scripts/validate-active-tools-surface.mjs`.
- PASS: `node scripts/validate-active-tools-surface.mjs`.
- PASS: `node scripts/validate-tool-registry.mjs`.
- PASS: targeted browser page sweep for every new shell.
- PASS: targeted scan found no inline script/style/event-handler usage in new shell pages.
- PASS: `npm run test:workspace-v2` using the legacy command name for the Project Workspace test lane.
- PASS: `git diff --check`.

## Manual Notes

- Each planned shell loads with header, footer, ToolDisplayMode, left column, center panel, and right column.
- Each planned shell is reachable from Toolbox navigation and the Toolbox index.
- No console errors or failed requests were observed in the targeted page sweep.
