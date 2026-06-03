# Palette V2 Directory Cleanup

## Decision
- New V2 implementation: `tools/Palette Manager v2/main.js`
- Legacy V1 restored to canonical path: `tools/Palette Browser/`
- Temporary legacy suffix removed: `tools/Palette Browser-v1/` no longer exists.

## Evidence
- `tools/Palette Manager v2/main.js` contains `[PALETTE_V2_ENTRY]`.
- `tools/Palette Manager v2/main.js` uses a single class, `PaletteManagerToolV2`.
- `tools/Palette Manager v2/main.js` reads session-backed `paletteJson` only.
- `tools/Palette Manager v2/main.js` displays `Palette Manager V2`.
- `tools/Palette Browser/main.js` is the restored legacy Palette Browser implementation.

## Validation
- `node --check "tools/Palette Manager v2/main.js"` passed.
- `node --check "tools/Palette Browser/main.js"` passed.
- Directory check: `tools/Palette Browser/` exists, `tools/Palette Browser-v1/` does not exist, `tools/Palette Manager v2/` exists.

## Packaging
- ZIP artifact: `tmp/PR_11_190_20260501_01.zip`
