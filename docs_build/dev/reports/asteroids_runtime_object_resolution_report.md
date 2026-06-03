# PR_26133_034 Asteroids Runtime Object Resolution Report

Date: 2026-05-14

## Scope

This change makes Asteroids runtime Object Vector lookup role/tag driven so duplicated or recreated objects can keep rendering even when their object ids change.

## Runtime Resolution

- Added Asteroids runtime role metadata for ship, large/medium/small asteroids, and large/small UFOs.
- Asteroids rendering now passes `runtimeRole` and required tags into the Object Vector runtime instead of selecting ship/UFO/asteroids with scene-local hardcoded object ids.
- Asteroid collision profiles now resolve asteroid objects by role tags before extracting polygon geometry.
- Explicit `game.gameData.objectVectorRuntime.objectIds` values are preserved as optional binding hints, but tag matches win when a binding points at a stale or old object.
- Multiple tag matches are ranked by non-old candidates first, then newest manifest order, and an actionable warning lists candidates and the selected object.

## Required Tags

- Large asteroid: `["asteroid", "large"]`
- Medium asteroid: `["asteroid", "medium"]`
- Small asteroid: `["asteroid", "small"]`
- Ship: `["player", "ship"]`
- Large UFO: `["ufo", "large"]`
- Small UFO: `["ufo", "small"]`

## Manifest Data

- Current Asteroids manifest object metadata already contains the required tags for all runtime roles.
- No renamed old Medium Asteroid entry is present in the current manifest data.
- Targeted tests construct a recreated Medium Asteroid with id `object.asteroids.asteroid.medium-recreated` and an old stale medium candidate to verify the active tag-correct object is selected.
- No vector-map-editor fallback geometry was added or restored.

## Validation

- PASS - `npm run test:workspace-v2` -> 49 passed.
- PASS - targeted Asteroids Asset Reference Adoption test for recreated/stale medium asteroid collision profile selection.
- PASS - targeted Asteroids Platform Demo test for Object Vector runtime tag resolution and stale explicit binding warning.
- PASS - targeted Asteroids collision timing/stress checks.
- PASS - targeted Asteroids validation smoke.
- PASS - targeted Asteroids manifest Object Vector runtime validation loaded 6 objects and resolved medium asteroid by tags.
