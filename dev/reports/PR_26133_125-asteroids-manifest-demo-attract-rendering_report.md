# PR_26133_125 Asteroids Manifest Demo Attract Rendering Report

## Summary

- Demo and Attract asteroid rendering now routes large, medium, and small asteroids through the shared Object Vector runtime renderer.
- Demo/Attract asteroid bindings use the same manifest object IDs as gameplay:
  - `object.asteroids.large-asteroid`
  - `object.asteroids.medium-asteroid`
  - `object.asteroids.small-asteroid`
- Gameplay asteroid rendering now passes the validated manifest object ID with `requireManifestBinding: true`, so background world asteroids shown during menu/attract screens also stay manifest-bound.
- Manifest-authored shape styles remain the rendering source; no asteroid colors, maps, or geometry were copied into Demo/Attract code.

## Cleanup Decisions

- Replaced the attract-only asteroid ID alias with explicit asteroid object IDs in `ASTEROIDS_OBJECT_GEOMETRY_IDS`.
- Added a small Demo/Attract asteroid binding helper that supplies object key, exact manifest object ID, and manifest-binding enforcement while leaving geometry and style to `ObjectVectorRuntimeAssetService`.
- Kept `attractAsteroid` only as the diagnostics render-count bucket so existing runtime diagnostics still report attract asteroid rendering.
- Did not change ship flame shapes/states or asteroid manifest geometry/scale data.

## Validation

- PASS `node -e "import('./tests/games/AsteroidsPresentation.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsPresentation'))"`
- PASS `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsValidation'))"`
- PASS `node -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsPlatformDemo'))"`
- PASS `node -e "import('./tests/games/AsteroidsAssetReferenceAdoption.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsAssetReferenceAdoption'))"`
- PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "loads Object Vector Studio V2 runtime assets into Asteroids gameplay rendering"`
- PASS `git diff --check` with line-ending warnings only.

## Manual Notes

- Playwright impacted: Yes.
- Playwright validates the Asteroids Object Vector runtime asset path, Demo/Attract asteroid object resolution, and gameplay object render counts.
- Expected pass behavior: Demo/Attract resolves large, medium, and small asteroid manifest objects and gameplay continues rendering Asteroids objects from Object Vector Studio V2 data.
- Expected fail behavior: missing or mismatched manifest object IDs fail runtime resolution instead of using a hardcoded Demo/Attract fallback.
- Full regression and full samples smoke tests were skipped per PR instructions.
