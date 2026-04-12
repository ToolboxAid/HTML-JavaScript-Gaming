# Templates Vector-Native Active Relocation Report

Generated: 2026-04-12  
Lane: narrow decouple-only

## Purpose
Decouple active vector-native template references from `templates/vector-native-arcade/` and standardize on the canonical active path:

- `tools/templates/vector-native-arcade/`

## Scope Applied
Modified only:
- `tools/shared/vectorNativeTemplate.js`
- `tools/shared/vectorTemplateSampleGame.js`
- `tests/tools/VectorNativeTemplate.test.mjs`
- `games/vector-arcade-sample/README.md`

## Changes Made
1. Updated vector-native template asset/config/docs/runtime path strings to use `tools/templates/vector-native-arcade/`.
2. Updated sample-game remap logic to map from `tools/templates/vector-native-arcade/` to `games/vector-arcade-sample/`.
3. Updated test assertion for `definition.templatePath` to the canonical active path.
4. Updated sample-game README template source path to the canonical active path.

## Move Decision
- No physical move performed in this lane.
- `templates/vector-native-arcade/` remains in place.
- Rationale: this lane is decouple-only and path normalization was completed in the four blocker files without requiring filesystem relocation for correctness in this PR.

## Validation Notes
- No bare legacy path references remain in the four target files (`templates/vector-native-arcade/` not preceded by `tools/`).
- No changes under:
  - `docs/dev/start_of_day/chatGPT/`
  - `docs/dev/start_of_day/codex/`
- `templates/starter-project-template/` untouched.
