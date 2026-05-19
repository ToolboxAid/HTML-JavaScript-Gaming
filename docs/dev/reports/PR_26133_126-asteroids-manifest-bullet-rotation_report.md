# PR_26133_126 Asteroids Manifest Bullet Rotation Report

## Summary

- Asteroids bullets now retain an instance `angle` when fired or restored from state.
- Player bullets capture the ship fire angle at spawn; UFO bullets capture the aimed fire angle.
- Bullet rendering still uses `object.asteroids.bullet` from the Object Vector Studio V2 manifest and now applies the bullet instance rotation through the shared Object Vector runtime.
- The manifest bullet object geometry, style, origin, and active state data are not mutated by runtime rendering.

## Implementation Notes

- `Bullet` stores a sanitized `angle` value beside position, velocity, and life.
- `AsteroidsWorld.fire()` passes `this.ship.angle` into new bullets.
- `Ufo.fireAt()` passes its computed `aimAngle` into new UFO bullets.
- `AsteroidsWorld` save/load includes bullet `angle`, with legacy state fallback inferred from bullet velocity when angle is missing.
- `AsteroidsGameScene` renders both player bullets and UFO bullets with `objectId: object.asteroids.bullet`, `requireManifestBinding: true`, and `rotation: bullet.angle`.

## Validation

- PASS `node -e "import('./tests/games/AsteroidsPresentation.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsPresentation'))"`
- PASS `node -e "import('./tests/games/AsteroidsVectorTransforms.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsVectorTransforms'))"`
- PASS `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsValidation'))"`
- PASS `node -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsPlatformDemo'))"`
- PASS `node -e "import('./tests/games/AsteroidsAssetReferenceAdoption.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsAssetReferenceAdoption'))"`
- PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
- PASS `git diff --check` with line-ending warnings only.

## Manual Notes

- Playwright impacted: Yes.
- Playwright validates the Asteroids Object Vector runtime asset path and gameplay bullet manifest rendering path.
- Expected pass behavior: bullets fired at different ship angles render the manifest bullet object with matching instance rotations.
- Expected fail behavior: missing `object.asteroids.bullet` or mismatched manifest binding fails through the Object Vector runtime instead of a hardcoded bullet draw fallback.
- Full regression and full samples smoke tests were skipped per PR instructions.
