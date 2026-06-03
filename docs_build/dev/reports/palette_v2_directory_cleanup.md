# Palette V2 Directory Cleanup

## Decision
- New V2 implementation: `toolbox/Palette Manager v2/main.js`
- Legacy V1 restored to canonical path: `toolbox/Palette Browser/`
- Temporary legacy suffix removed: `toolbox/Palette Browser-v1/` no longer exists.

## Evidence
- `toolbox/Palette Manager v2/main.js` contains `[PALETTE_V2_ENTRY]`.
- `toolbox/Palette Manager v2/main.js` uses a single class, `PaletteManagerToolV2`.
- `toolbox/Palette Manager v2/main.js` reads session-backed `paletteJson` only.
- `toolbox/Palette Manager v2/main.js` displays `Palette Manager V2`.
- `toolbox/Palette Browser/main.js` is the restored legacy Palette Browser implementation.

## Validation
- `node --check "toolbox/Palette Manager v2/main.js"` passed.
- `node --check "toolbox/Palette Browser/main.js"` passed.
- Directory check: `toolbox/Palette Browser/` exists, `toolbox/Palette Browser-v1/` does not exist, `toolbox/Palette Manager v2/` exists.

## Packaging
- ZIP artifact: `tmp/PR_11_190_20260501_01.zip`
