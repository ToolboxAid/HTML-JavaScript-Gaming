# BUILD_PR - PR_26124_075-palette-browser-launch-registration-fix

## Purpose
Perform one scoped launch metadata fix so palette-backed samples use the active Palette Manager V2 launch id instead of the palette data key.

## Scope
- `samples/metadata/samples.index.metadata.json`
- Targeted validation test file only if required.
- Required PR workflow docs and review artifacts.

## Implementation
1. Update only palette sample launch metadata:
   - `toolHints[]`: `palette-browser` -> `palette-manager-v2`
   - `roundtripToolPresets[].toolId`: `palette-browser` -> `palette-manager-v2`
2. Preserve existing `presetPath` values.
3. Preserve `tools.palette-browser` data keys and sample palette JSON files.
4. Do not add registry aliases because `resolveToolIdAlias` does not currently implement aliases.

## Boundaries
- Do not modify tools.
- Do not modify workspace/toolState/session behavior.
- Do not touch sample palette JSON files.
- Do not modify sample launch code.
- Do not add fallback/default data.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Validation
- Syntax check changed JSON files by parsing.
- Run targeted metadata registry validation for sample `toolHints` and `roundtripToolPresets`.
- Run targeted Samples index launch validation that reproduces the registration-error surface.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.
- Skip the full samples smoke test.
