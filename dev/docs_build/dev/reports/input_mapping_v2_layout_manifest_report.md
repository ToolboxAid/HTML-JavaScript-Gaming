# Input Mapping V2 Layout and Manifest Report

Task: PR_26140_088-polish-input-mapping-v2-layout-and-manifest

## Summary
- Updated Input Mapping V2 to use the full available horizontal workspace with fixed left/right columns and an expanding center mapping area.
- Added vertical scrolling and fixed 175px by 175px grid tiles for captured mappings.
- Kept the captured mapping list empty until an input is captured, then renders captured mappings only.
- Set capture buttons to 150px wide.
- Updated the right column accordions to share vertical space evenly.
- Added `Start`, `Select`, and `Pause` to default actions and sorted all default/custom actions alphabetically.

## Manifest and Schema Registration
- Added `tools.input-mapping-v2` to `games/Asteroids/game.manifest.json` as a manifest-owned V2 tool payload with empty inputs.
- Added the minimal `toolbox/schemas/tools/input-mapping-v2.schema.json` payload schema because the game manifest schema rejects unknown tool payload keys.
- Updated `toolbox/schemas/game.manifest.schema.json` to allow `tools.input-mapping-v2`.
- Updated Workspace Manager V2 payload schema registration so Input Mapping V2 validates through the same manifest/toolState path as other active V2 tools.

## Playwright Impact
Playwright impacted: Yes.

Validated behavior:
- Input Mapping V2 launches from the current V2 template shell.
- Full-width layout pins left/right columns and expands the center workspace.
- Mapping list starts empty, has vertical scroll behavior, and renders 175px grid tiles after capture.
- Action dropdown includes `Pause`, `Select`, and `Start` and is sorted alphabetically.
- Keyboard capture records `Keyboard KeyA` and clicking the token deletes it.
- Gamepad capture logs an actionable WARN when live browser gamepad data is unavailable.
- Asteroids game manifest includes the Input Mapping V2 payload and Workspace Manager validates it through the new schema.

## Validation
- PASS: targeted `node --check` syntax/import validation for changed Input Mapping V2 and Workspace Manager files.
- PASS: JSON parse validation for `games/Asteroids/game.manifest.json`, `toolbox/schemas/game.manifest.schema.json`, and `toolbox/schemas/tools/input-mapping-v2.schema.json`.
- PASS: HTML inline script/style/event-handler scan for Input Mapping V2 HTML files returned no matches.
- PASS: focused Playwright validation for Input Mapping V2 and Workspace Manager tile launch paths.
- PASS: `npm run test:workspace-v2` with 60 passing tests.
- PASS: Playwright V8 coverage guardrail lists changed runtime JavaScript files with no WARN entries.

## Scope Notes
- No sample JSON files were changed.
- Full samples smoke test was skipped because the PR is limited to Input Mapping V2 layout, focused manifest registration, and Workspace V2 validation.
- No commits were created.
