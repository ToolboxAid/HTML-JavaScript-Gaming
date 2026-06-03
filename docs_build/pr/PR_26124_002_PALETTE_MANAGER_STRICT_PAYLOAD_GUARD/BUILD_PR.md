# BUILD_PR — PR_26124_002

## Scope
- Single tool only: `palette-manager-v2`
- Minimal surgical fix

## Implemented
- Added strict validation in `loadContract`:
  - if `payloadJson.paletteDocument.colors` exists, reject session before render with a clear error:
    - `payloadJson.paletteDocument.colors is not supported; use payloadJson.paletteDocument.swatches.`

## Why
- Keeps payload contract strict and deterministic.
- Prevents legacy invalid palette JSON from rendering.

## Validation
- `node --check toolbox/palette-manager-v2/index.js` -> PASS
- `npm run test:workspace-v2` -> PASS (`1 passed`, `failed=0`)

## Samples Smoke
- Skipped by design.
- Reason: single-tool runtime guard update with targeted validation and no shared sample framework changes.
