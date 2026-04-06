# PLAN_PR_VECTOR_NATIVE_TEMPLATE

## Goal
Define a reusable vector-native game template that uses first-class vector assets as the default and required visual path,
building on the accepted vector-only runtime baseline without reintroducing sprite fallback dependencies.

## Why This PR Exists
The Asteroids demo now proves that the platform can author, validate, package, publish, and run a vector-only game.
The next multiplier is to turn that success into a reusable template so future vector-native games can start from a clean,
validated, platform-approved baseline instead of rebuilding the same structure each time.

## Intent
- create a true vector-native template
- preserve accepted strict validation, packaging, runtime, CI, export, and publishing boundaries
- make vector-first authoring the default path for new arcade-style games
- avoid reintroducing sprite fallback as an active runtime dependency

## Scope
- define template structure for vector-native projects
- define required vector asset categories for template bootstrapping
- define template registry, dependency graph, validation, packaging, and runtime expectations
- define debug/profiler/template/publishing participation for vector-native projects
- define migration and starter content expectations for future vector-led demos/games

## Non-Goals
- No engine core API changes
- No broad template redesign for unrelated game styles
- No sprite fallback dependency in the vector-native template baseline
- No destructive migration of existing non-vector templates
- No bypass of accepted validation, packaging, runtime, CI, export, or publishing boundaries

## Template Intent
The vector-native template should serve as the default starting point for games that benefit from:
- geometric line art
- clean scaling
- rotation without raster artifacts
- low-overhead visual definitions
- classic arcade or abstract visual styles

## Proposed Template Path
```text
templates/vector-native-arcade/
```

## Proposed Baseline Structure
```text
templates/vector-native-arcade/
  assets/
    palettes/
    vectors/
    tilemaps/
    parallax/
  config/
  runtime/
  docs/
```

## Required Vector Asset Categories
- player vehicle/entity vector
- enemy or obstacle vector set
- title or UI vector treatment
- optional vector HUD or indicator elements
- vector-aware startup configuration

## Core Contracts
1. Vector assets are the required primary visual contract.
2. Registry owns vector asset identity and template content.
3. Dependency graph records template vector relationships deterministically.
4. Validation enforces vector-native requirements.
5. Packaging includes vector-native assets deterministically.
6. Runtime loads vector-native packaged content without sprite fallback.
7. Debug, profiler, export, publishing, and CI systems all recognize the template as first-class.
8. No engine core APIs are changed.

## Template Expectations
- ships with a minimal playable or near-playable bootstrap state
- demonstrates title/start/gameplay/restart flow hooks
- exposes clean extension points for future game-specific logic
- preserves docs-first compatibility with platform workflow
- provides a reliable starting point for future vector-first demos

## Likely Files
- `docs/pr/BUILD_PR_VECTOR_NATIVE_TEMPLATE.md`
- template content under `templates/vector-native-arcade/`
- vector starter assets and config
- docs/dev reports
- no engine core API files

## Acceptance Criteria
1. Template validates successfully as vector-native content.
2. Packaging succeeds without sprite fallback dependency.
3. Runtime reaches ready state from template-packaged content.
4. Debug and profiler surfaces reflect vector-native template participation.
5. Export and publishing remain compatible.
6. Template is reusable for future vector-led games.
7. No engine core APIs are changed.

## Manual Validation Checklist
1. Template contains required vector asset categories.
2. Registry/dependency graph include vector-native template assets.
3. Validation passes with no blocking findings.
4. Packaging remains deterministic.
5. Runtime reaches ready state.
6. No sprite fallback is required.
7. Debug/profiler/export/publishing remain ready.
8. No engine core APIs are changed.

## Approved Commit Comment
plan(template): define reusable vector-native arcade template

## Next Command
BUILD_PR_VECTOR_NATIVE_TEMPLATE
