# PR_26133_129 Asteroids Manifest Runtime Normalization

## Summary
- Normalized Asteroids gameplay/demo/attract object rendering to exact Object Vector Studio V2 manifest object IDs.
- Removed the active tag-based runtime lookup module and stopped passing `tags`/`runtimeRole` options into Asteroids object rendering.
- Updated gameplay collision/profile geometry to resolve by exact manifest object ID instead of tag-derived runtime keys.
- Preserved ship flame flicker, asteroid scale tuning, and the PR_26133_128 non-object effect/UI draw systems.

## Final Active Object IDs
- Bullet: `object.asteroids.bullet`
- Ship: `object.asteroids.ship`
- Large asteroid: `object.asteroids.large-asteroid`
- Medium asteroid: `object.asteroids.medium-asteroid`
- Small asteroid: `object.asteroids.small-asteroid`
- Large UFO: `object.asteroids.large-ufo`
- Small UFO: `object.asteroids.small-ufo`

## Removed Aliases And Indirect Lookup Paths
- Deleted `games/Asteroids/game/asteroidsObjectTags.js`.
- Removed active imports/usages of:
  - `ASTEROIDS_RUNTIME_OBJECT_TAGS`
  - `ASTEROID_SIZE_RUNTIME_OBJECT_KEYS`
  - `runtimeObjectTagOptions`
  - `resolveAsteroidsTaggedObject`
  - `validateAsteroidsRuntimeObjectTags`
  - `objectsByKey`
- Removed tag/runtime-role options from gameplay/demo/attract render calls.
- Replaced runtime cache expectations with direct object-ID cache messages.
- Replaced runtime object validation with exact required object ID validation.

## Remaining Intentional Non-Object Draw Systems
- Starfield background pixels: procedural background effect.
- HUD/menu/high-score text: UI text.
- Attract text panels and demo trail pixels: UI/effect drawing.
- Pause and initials overlays: modal UI.
- Particle effects: transient randomized effects.
- Ship debris fragments: runtime destruction effect using manifest-derived ship hull points from PR_26133_128.

## Validation
- PASS: targeted Asteroids node validation:
  - `AsteroidsValidation`
  - `AsteroidsPresentation`
  - `AsteroidsVectorTransforms`
  - `AsteroidsPlatformDemo`
  - `AsteroidsAssetReferenceAdoption`
- PASS: targeted Workspace Manager V2/Asteroids Playwright validation:
  - `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
- PASS: `git diff --check`
- Playwright impacted: Yes. This PR changes Asteroids runtime object lookup/render behavior and validates Asteroids launch, attract/demo object rendering, gameplay object rendering, and bullet rotation via the targeted browser slice.
- Full samples smoke test skipped as requested; this PR only touches Asteroids runtime normalization.

## Manual Validation
- Open `/games/Asteroids/index.html`.
- Let attract/demo run; expected: ship, UFO, and asteroids render through Object Vector Studio V2 manifest object IDs.
- Start gameplay; expected: ship, bullets, asteroids, UFOs, and life icons render from the same manifest object renderer path.
- Fire bullets at multiple ship angles; expected: `object.asteroids.bullet` preserves manifest styling and rotates with the shot direction.
