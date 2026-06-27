# Tool Image Targeted MSJ Tests

## Test Lane

- Added package script: `npm run test:lane:tool-images`.
- Added lane registration in `scripts/run-targeted-test-lanes.mjs`.
- Added Playwright spec: `tests/playwright/tools/ToolImageRegistry.spec.mjs`.

## Covered Behavior

- Every active/planned registry tool has `badge` and `tool` fields.
- Registry paths stay under the approved Theme V2 badge/tool directories.
- Registry paths do not contain banned size suffixes.
- Missing artwork uses the registry fallback.
- Toolbox cards consume registry image sources.
- Representative tool pages consume registry images in Tool Display Mode.
- Page load checks reported no console errors, page errors, failed requests, or request failures.

## Validation

- `node --check toolbox/toolRegistry.js` - PASS
- `node --check toolbox/tools-page-accordions.js` - PASS
- `node --check assets/theme-v2/js/tool-display-mode.js` - PASS
- `node --check scripts/run-targeted-test-lanes.mjs` - PASS
- `node --check tests/playwright/tools/ToolImageRegistry.spec.mjs` - PASS
- `npm run test:lane:tool-images` - PASS, 4 Playwright tests
- `git diff --check` - PASS

## Targeted Lane Notes

- Impacted lane: `tool-images`.
- Skipped lanes: `workspace-contract`, `project-workspace`, `game-design`, `game-configuration`, `build-path`, `tools-progress`, `tool-navigation`, `tool-display-mode`, `tool-runtime`, `game-runtime`, `integration`, `engine-src`, `samples`.
- Skipped-lane rationale: this PR changes Toolbox image registry metadata, the Toolbox image consumer, and Tool Display Mode image consumption only; it does not change launch/navigation contracts, DB/auth/persistence, samples, engine runtime, or unrelated tool behavior.
- `npm run test:workspace-v2` was skipped because that command name is legacy for the Project Workspace lane and the narrow image-registry lane proves this scoped change.

## Manual Test Notes

- Open `toolbox/index.html?role=admin` and confirm Toolbox cards render preview images and badges without 404s.
- Open `toolbox/project-workspace/index.html`, `toolbox/game-design/index.html`, `toolbox/game-configuration/index.html`, and `toolbox/build-game/index.html` and confirm Tool Display Mode badge/tool images render without console errors.
- Confirm any missing artwork uses the shared `image-missing.svg` fallback instead of a broken image request.

## Coverage Notes

- Playwright V8 coverage was produced by the targeted lane.
- Changed browser runtime files covered: `toolbox/toolRegistry.js`, `toolbox/tools-page-accordions.js`, and `assets/theme-v2/js/tool-display-mode.js`.
- Node/test runner files are not browser runtime coverage targets.
