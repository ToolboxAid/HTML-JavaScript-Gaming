# PR_26133_036 Asteroids Manifest Runtime Validation Report

Task: PR_26133_036-asteroids-manifest-name-validation-no-fallback
Date: 2026-05-15

## Binding Contract

Asteroids runtime roles now require explicit manifest bindings from:

`game.gameData.objectVectorRuntime.objectIds`

Required roles:

- `ship` -> tags `player`, `ship`
- `asteroidLarge` -> tags `asteroid`, `large`
- `asteroidMedium` -> tags `asteroid`, `medium`
- `asteroidSmall` -> tags `asteroid`, `small`
- `ufoLarge` -> tags `ufo`, `large`
- `ufoSmall` -> tags `ufo`, `small`

## Runtime Behavior

- Valid manifest bindings are checked before `AsteroidsGameScene` starts gameplay.
- Missing bindings fail with the exact missing manifest path.
- Bindings pointing at missing objects fail with the requested object ID.
- Bindings pointing at objects without required tags fail with required and actual tag data.
- Duplicate tag candidates do not use newest/non-old guessing; runtime logs exact candidates and uses the explicit manifest binding only when it is valid.
- Old/legacy tagged objects cannot be selected by runtime binding.

## Manifest Data

- `object.asteroids.medium-asteroid` remains the runtime-bound Medium Asteroid.
- `object.asteroids.medium-asteroid-2` is retained as a distinct editable Medium Asteroid 2 with medium tags and medium geometry.
- Medium duplicate candidates are logged, and runtime deterministically selects `object.asteroids.medium-asteroid` from the manifest binding.

## Fallback Removal Check

PASS - No Asteroids/shared runtime references found for:

```text
BASE_VECTOR_MAP
ASTEROIDS_*_SVG
vector.asteroids.*
```

Generic non-Asteroids Object Vector tag selection remains available for callers that do not opt into `requireManifestBinding`; Asteroids runtime calls opt into strict manifest binding.

## Validation

PASS - `npm run test:workspace-v2`: 49 passed, 0 failed.

PASS - `node -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then((m)=>m.run())"`

PASS - `node -e "import('./tests/games/AsteroidsAssetReferenceAdoption.test.mjs').then((m)=>m.run())"`

PASS - Targeted binding validation:

```json
{
  "objectCount": 7,
  "valid": true,
  "selectedMedium": "object.asteroids.medium-asteroid",
  "missingMediumFails": true,
  "invalidMediumFails": true
}
```
