# Engine Import Baseline Report

Generated: 2026-04-12
Lane: BUILD_PR_ENGINE_IMPORT_BASELINE_AND_CONTRACT

## Scope Scanned
- `src/`
- `games/`
- `samples/`
- `tools/`
- relevant HTML files under those directories
- docs and templates excluded from baseline metrics

## Baseline Metrics (`src/engine/` reference scan)
- Total matches: `1775`
- Unique files: `790`

By top-level area:
- `samples`: `1506`
- `games`: `143`
- `tools`: `112`
- `src`: `14`

By style:
- `root-absolute` (`/src/engine/...`): `1486`
- `relative-up-path` (`../../src/engine/...` etc.): `215`
- `other-src-engine-ref` (`src/engine/...` non-import/contextual refs): `74`

By extension:
- `.js`: `1465`
- `.html`: `236`
- `.json`: `70`
- `.md`: `4`

## HTML-Specific Baseline
- HTML matches: `236`
- HTML unique files: `231`
- HTML style split:
  - `relative-up-path`: `214`
  - `root-absolute`: `22`

## Non-HTML Baseline
- Non-HTML matches: `1539`
- Non-HTML unique files: `559`
- Non-HTML style split:
  - `root-absolute`: `1464`
  - `relative-up-path`: `1`
  - `other-src-engine-ref`: `74`

## Observed Pattern
- Runtime/module code is predominantly rooted on `/src/engine/...`.
- Nested HTML entry points predominantly use relative `../..` paths to `src/engine/...` assets.
- `other-src-engine-ref` entries are largely README/config/baseline metadata references rather than active import-style divergence.