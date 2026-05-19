# PR_26133_128 Asteroids Effect Render Path Audit

## Summary
- Audited the direct renderer draws left after PR_26133_127.
- Kept UI/effect draws out of Object Vector Studio V2 when they are not persistent object geometry.
- Removed the remaining hardcoded object-like effect geometry: ship debris fragments now derive their segment geometry from the manifest-owned ship hull points already loaded by `AsteroidsWorld`.
- Did not change ship flame flicker, asteroid scale tuning, manifest object geometry, or vector map fallback behavior.

## Direct Draw Classification

| Path | Classification | Decision |
| --- | --- | --- |
| Starfield background pixels | Allowed non-object effect/UI draw; intentional runtime effect | Stays as the custom background callback. Stars are procedural background pixels, not Object Vector Studio V2 objects. |
| HUD/menu text | Allowed non-object effect/UI draw | Stays as renderer text. Scores, labels, and prompts are UI text, not game object geometry. |
| Attract text panels | Allowed non-object effect/UI draw | Stays as translucent UI panel rectangles. They frame text and are not authored gameplay objects. |
| Demo trail pixels | Documented as intentional runtime effect | Stays as procedural 2x2 trail pixels tied to demo motion and fade timing. |
| Pause/initials overlays | Allowed non-object effect/UI draw | Stays as modal UI rectangles/text/strokes. They are interface state, not manifest object geometry. |
| Particle effects | Documented as intentional runtime effect | Stays in the generic particle system. Explosion particles are transient circles/rects with randomized size, velocity, and fade. |
| Ship debris fragments | Should use manifest object geometry source; documented as intentional runtime effect | Updated. Debris remains a direct draw effect because fragments need independent velocity/spin/fade, but its hull segments now come from manifest-derived ship geometry instead of a second hardcoded ship shape. |

## Code Changes
- `games/Asteroids/systems/ShipDebrisSystem.js`
  - Removed the hardcoded `SHIP_SEGMENTS` ship outline.
  - Builds debris segments from injected ship geometry points.
  - Fails visibly/actionably if debris spawn is attempted without manifest-derived hull segments.
- `games/Asteroids/game/AsteroidsGameScene.js`
  - Passes `this.world.shipCollisionPoints` into `ShipDebrisSystem`; those points are loaded from the Asteroids Object Vector Studio V2 manifest.
- `tests/games/AsteroidsPresentation.test.mjs`
  - Added targeted coverage proving ship debris uses the current manifest-owned scaled ship hull points.

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
- Playwright impacted: Yes. This PR changes an Asteroids runtime effect path and validates launch, attract/demo, gameplay manifest rendering, and bullet/object rendering through the targeted browser slice.
- Full samples smoke test skipped as requested; this PR only touches Asteroids effect render-path audit/cleanup.

## Manual Validation
- Open `/games/Asteroids/index.html`.
- Start gameplay and destroy the ship; expected: debris fragments appear as the same runtime destruction effect, using the manifest-owned ship hull shape as the segment source.
- Let attract/demo run; expected: attract/demo objects still render from manifest Object Vector Studio V2 objects.
- Fire bullets at multiple ship angles; expected: bullet geometry/style remains manifest-owned and bullet rotation follows firing direction.
