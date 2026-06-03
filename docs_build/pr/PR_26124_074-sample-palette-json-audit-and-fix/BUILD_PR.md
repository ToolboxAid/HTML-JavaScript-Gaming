# BUILD_PR - PR_26124_074-sample-palette-json-audit-and-fix

## Purpose
Perform one scoped data cleanup: audit and fix sample palette JSON files so their swatches match the current palette schema contract.

## Scope
- `samples/**/*.palette.json`
- Required PR workflow docs and review artifacts.

## Pattern Note
The requested literal pattern `samples/**/palette.*.*.json` has no matches in this repository. The actual sample palette JSON files use `sample.<id>.palette.json`, so the executable target set is `samples/**/*.palette.json`.

## Implementation
1. Enumerate `samples/**/*.palette.json`.
2. Parse and rewrite only files requiring schema fixes.
3. Preserve top-level palette metadata already allowed by `tools/schemas/tools/palette-browser.schema.json`.
4. Normalize each swatch to:
   - `symbol`: one-character string,
   - `hex`: `#RRGGBB` or `#RRGGBBAA`,
   - `name`: non-empty string,
   - optional `tags`: lowercase non-empty strings.
5. Remove extra swatch properties.
6. Remove duplicate swatches within a palette by duplicate `name`, `hex`, or `symbol`, preserving the first occurrence.
7. Keep JSON formatting stable and compact for primitive arrays where tags exist.

## Boundaries
- Do not modify tools.
- Do not modify workspace/toolState/session behavior.
- Do not modify sample launch code.
- Do not add fallback/default data.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Validation
- Syntax check every `samples/**/*.palette.json` file by parsing JSON.
- Validate every `samples/**/*.palette.json` file against the current palette swatch contract.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.
- Skip the full samples smoke test.
