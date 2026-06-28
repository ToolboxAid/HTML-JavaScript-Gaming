# BUILD_PR_LEVEL_10_6E_PALETTE_SSOT_NORMALIZATION

## Purpose

Normalize Sample 0313 palette handling so there is exactly one palette source of truth.

## Problem

Two uploaded files show the same palette content in two shapes:

- `sample.0313.palette.json` is the canonical palette payload.
- `sample.0313.palette-browser.json` duplicates the same palette under `config.palette` with a tool-specific wrapper.

Palette Browser must consume the canonical palette input directly through the sample manifest/data-flow. It must not require a duplicate tool-shaped palette JSON.

## Explicit Codex Steps

1. Locate the Sample 0313 palette files in the workspace:
   - `sample.0313.palette.json`
   - `sample.0313.palette-browser.json`
2. Treat `sample.0313.palette.json` as the source of truth.
3. Find every reference to `sample.0313.palette-browser.json`.
4. Update the sample manifest or tool binding so Palette Browser receives the canonical palette directly.
5. If a generator creates `sample.0313.palette-browser.json`, update it so it no longer emits duplicated palette data.
6. If Palette Browser expects `$schema`, `tool`, or `config.palette`, move that adaptation to the normalization boundary and pass only the canonical palette payload into the tool.
7. Do not rename palette fields.
8. Do not reshape `swatches`.
9. Do not convert the palette to `engine.paletteList`.
10. Do not add fallback colors.
11. Do not hardcode Sample 0313 paths inside Palette Browser.
12. Remove or de-reference the duplicate browser JSON only after all references are updated.
13. Update the report with exact files changed and before/after data-flow.
14. Update the master roadmap status only if an execution-backed matching item exists. Status-only marker updates are allowed; no roadmap text rewrite.

## Required Final Data Flow

```text
sample manifest → canonical palette JSON → normalized tool input → Palette Browser UI/state
```

## Acceptance Criteria

- One canonical Sample 0313 palette JSON remains.
- Palette Browser loads the canonical palette directly.
- `sample.0313.palette-browser.json` is no longer required.
- `npm run test:sample-standalone:data-flow` passes.
- `npm run test:launch-smoke:games` passes.
- Report lists all duplicate references found and the action taken.
- No hidden default/fallback palette data exists.

## Out of Scope

- No start_of_day changes.
- No broad tool registry refactor.
- No unrelated sample changes.
