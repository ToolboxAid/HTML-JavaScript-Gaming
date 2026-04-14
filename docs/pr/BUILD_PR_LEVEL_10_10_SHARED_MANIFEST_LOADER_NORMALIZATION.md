# BUILD_PR_LEVEL_10_10_SHARED_MANIFEST_LOADER_NORMALIZATION

## Problem
Shared pipeline loader is incorrectly scoped to Asteroids:
- Filename includes "asteroids"
- API names are game-specific
- Hardcoded path to Asteroids assets

This violates shared pipeline contract.

## Purpose
Normalize loader to be game-agnostic.

## Scope
- Rename loader to generic name
- Replace Asteroids-specific API with generic API
- Parameterize game path input

## Required Changes (Codex)
- Rename:
  tools/shared/pipeline/asteroidsAssetManifestLoader.js
  → tools/shared/pipeline/assetManifestLoader.js

- Replace API:
  loadAsteroidsAssetManifest → loadAssetManifest(gameId, options?)
  discoverAsteroidsRuntimeAssets → discoverRuntimeAssets(gameId, options?)

- Remove hardcoded path:
  games/Asteroids/assets/...
  → games/<gameId>/assets/...

## Testable Outcome
- Loader works for Asteroids via parameter
- No game-specific naming remains
- Existing Asteroids test updated to pass gameId

## Non-Goals
- No engine modification