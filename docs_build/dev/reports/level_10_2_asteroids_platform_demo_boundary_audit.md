# Level 10.2 Asteroids Platform Demo Boundary Audit

## File Audited
- `tools/shared/asteroidsPlatformDemo.js`

## Consumers (Who Imports It)
- `tests/games/AsteroidsPlatformDemo.test.mjs`
- `tests/games/AsteroidsAssetReferenceAdoption.test.mjs`

No runtime game boot/module import was found outside tests.

## Imports Used By `asteroidsPlatformDemo.js`
- `./projectAssetValidation.js`
- `./projectAssetRemediation.js`
- `./projectPackaging.js`
- `./runtimeAssetLoader.js`
- `./gameplaySystemLayer.js`
- `./gameTemplates.js`
- `./multiTargetExport.js`
- `./debugVisualizationLayer.js`
- `./performanceProfiler.js`
- `./publishingPipeline.js`
- `./vector/vectorAssetBridge.js`
- `../../src/shared/utils/jsonUtils.js`
- `./pipeline/runtimeAssetLookup.js`

## Domain Ownership Assessment
- The file is strongly Asteroids/game-specific:
  - hardcoded `Asteroids` identifiers
  - `games/Asteroids/...` manifest fragment paths
  - `games/Asteroids/main.js` runtime handoff expectations
  - Asteroids-specific vector/tilemap/parallax/palette asset IDs
- It orchestrates tool/shared pipeline modules, but the orchestration content is game-domain specific.

## Boundary Conclusion
- Current placement in `tools/shared/` is a boundary smell.
- The file is not a tool-agnostic shared utility.

## Recommended Target
- Preferred ownership target:
  - `games/Asteroids/shared/asteroidsPlatformDemo.js`
- Alternative if retained as test fixture-only orchestration:
  - `tests/fixtures/games/asteroidsPlatformDemo.js`

## Move Decision For This PR
- **No move in Level 10.2**.
- Reason:
  - safe move requires coordinated import updates and re-validation across the Asteroids demo tests and dependent pipeline assumptions.
  - this PR scope is focused on Workspace Manager open-action runtime testing plus audit.

## Follow-Up Recommendation
- Create a focused follow-up BUILD to relocate `tools/shared/asteroidsPlatformDemo.js` to a game-owned or test-fixture-owned boundary and update imports atomically.
