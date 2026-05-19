# PR_26139_001 Asteroids DVG Manifest Geometry

## Summary
- Retrieved original Asteroids DVG object drawing instructions from public source/disassembly references.
- Converted the relative DVG vector instructions into absolute Object Vector Studio V2 `objects[].shapes[]` geometry.
- Updated only `games/Asteroids/game.manifest.json` target object `shapes[]` data for bullet, ship, asteroids, and UFOs.
- Left runtime code, object IDs, tags, states, styles, object origins, schemas, and fallback behavior unchanged.

## Public Source References
- Computer Archeology Asteroids Vector ROM listing: `https://www.computerarcheology.com/Arcade/Asteroids/VectorROM.html`
- Computer Archeology Asteroids DVG notes: `https://www.computerarcheology.com/Arcade/Asteroids/DVG.html`
- 6502bench Asteroids disassembly: `https://www.6502disassembly.com/va-asteroids/Asteroids.html`
- Historical Atari source mirror: `https://github.com/historicalsource/asteroids`
- Historical source file used for vector object instructions: `https://raw.githubusercontent.com/historicalsource/asteroids/main/A35127.XX`
- Historical source file used for bullet/size runtime confirmation: `https://raw.githubusercontent.com/historicalsource/asteroids/main/A35131.1A`

## Conversion Notes
- Converted `VCTR x,y,brightness` instructions by accumulating each relative vector delta into absolute Object Vector Studio V2 point coordinates.
- Preserved DVG beam-off moves as geometry breaks. The saucer body is therefore one polyline plus one separate line shape.
- Preserved existing ship flame flicker state behavior by keeping the existing flame line shape slots and updating their coordinates to the DVG flame vectors.
- Represented the original torpedo `VGDOT` bullet draw as a small square polygon centered on the existing bullet origin because Object Vector Studio V2 manifest geometry is shape-based.
- The original source provides reusable rock patterns plus runtime size scaling. Current manifest runtime uses size-specific object IDs, so `ROCK1` was converted once and applied at full, half, and quarter scale to large, medium, and small asteroid objects.

## Objects Updated
- `object.asteroids.bullet`
- `object.asteroids.ship`
- `object.asteroids.large-asteroid`
- `object.asteroids.medium-asteroid`
- `object.asteroids.small-asteroid`
- `object.asteroids.large-ufo`
- `object.asteroids.small-ufo`

## Scope Guard
- PASS: script comparison against `HEAD` confirmed `games/Asteroids/game.manifest.json` changes are limited to the seven target `objects[].shapes[]` arrays.
- PASS: no runtime code changes were made for this task.

## Validation
- PASS: targeted Asteroids node validation:
  - `tests/games/AsteroidsValidation.test.mjs`
  - `tests/games/AsteroidsAssetReferenceAdoption.test.mjs`
  - `tests/games/AsteroidsPlatformDemo.test.mjs`
  - `tests/games/AsteroidsPresentation.test.mjs`
  - `tests/games/AsteroidsVectorTransforms.test.mjs`
- PASS: targeted Workspace Manager V2/Asteroids Playwright validation:
  - `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --workers=1 --reporter=list -g "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
- PASS: targeted Workspace Manager V2 Small UFO shape-list validation:
  - `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --workers=1 --reporter=list -g "uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
- FAIL: full Workspace Manager V2 gate:
  - `npm run test:workspace-v2`
  - Result after fixing the Small UFO two-shape expectation: 54 passed, 2 failed.
  - Remaining failures are outside this DVG geometry delta:
    - `validates optional Text to Speech V2 schema contract through Workspace Manager V2 schema` expects Asteroids to include `text2speech-V2`.
    - `tracks Object Vector Studio V2 dirty state through persisted edits and save outcomes` expects invalid object-vector session data to block manifest save.
- PASS: `git diff --check`
- Playwright impacted: Yes. This changes manifest geometry consumed by Asteroids runtime rendering and validates the Workspace Manager V2 launch/runtime object rendering path.

## Manual Validation
- Open `/games/Asteroids/index.html`.
- Expected: ship, bullet, asteroid, and UFO objects render from Object Vector Studio V2 manifest geometry.
- Fire bullets at several ship angles. Expected: bullets keep manifest-authored shape/style while runtime rotation still follows the shot angle.
