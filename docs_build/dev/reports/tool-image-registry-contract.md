# Tool Image Registry Contract

Stacked PRs:
- PR_26155_106-tool-image-registry-contract
- PR_26155_107-tool-image-mapping
- PR_26155_108-tool-image-coverage-report
- PR_26155_109-tool-image-targeted-msj-tests

## Contract

- Every active/planned Toolbox registry entry now defines direct `badge` and `tool` fields.
- `badge` paths are rooted under `/assets/theme-v2/images/badges/`.
- `tool` paths are rooted under `/assets/theme-v2/images/tools/`.
- The registry does not use a `hero` image field.
- Registry image paths avoid banned size suffixes: `-64`, `-1024`, and `-400x225`.
- Missing artwork resolves through the registry-owned `TOOL_IMAGE_FALLBACK` helper, not page-specific fallback logic.

## Runtime Consumers

- `toolbox/tools-page-accordions.js` imports `getToolRegistry`, `getToolImageSource`, and `TOOL_IMAGE_FALLBACK` from `toolbox/toolRegistry.js`.
- The transitional Toolbox renderer no longer carries local `tool.image` placeholder fields; card preview and badge sources come from the registry helper.
- `assets/theme-v2/js/tool-display-mode.js` dynamically imports `toolbox/toolRegistry.js` and applies `getToolImageSource()` for badge/tool display images.

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

## Theme V2 Gap Findings

No new CSS was added. No Theme V2 styling gap was found for this registry/image mapping change.
