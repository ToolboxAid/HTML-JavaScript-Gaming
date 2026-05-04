# PLAN_PR - PR_26124_074-sample-palette-json-audit-and-fix

## Goal
Audit sample palette JSON files and fix schema violations against the current palette browser swatch contract.

## Scope
- `samples/**/*.palette.json`
- Required PR workflow docs and review artifacts.

## Pattern Note
The requested literal pattern `samples/**/palette.*.*.json` does not match files in this repository. The sample palette files are named `sample.<id>.palette.json`, so this PR audits and fixes only `samples/**/*.palette.json`.

## Boundaries
- Do not modify tools.
- Do not modify workspace/toolState/session behavior.
- Do not modify sample launch code.
- Do not add fallback/default data.
- Do not add dependencies.
- Do not run the full samples smoke test.
- Avoid broad refactor outside sample palette JSON.

## Implementation Plan
1. Enumerate all `samples/**/*.palette.json` files.
2. Parse each JSON file.
3. Validate top-level palette document shape using the existing `tools/schemas/tools/palette-browser.schema.json` contract.
4. For each swatch, keep only valid contract properties:
   - required `symbol`, `hex`, `name`;
   - optional `tags`.
5. Normalize swatch tags to lowercase non-empty strings.
6. Remove invalid/extra swatch properties.
7. Detect duplicate swatches by `name`, `hex`, and `symbol` within each palette and preserve the first occurrence.
8. Preserve intended palette content while making only schema corrections.

## Playwright
- Default requested gate: `npm run test:workspace-v2`.
- Expected pass behavior: Workspace V2 validation runs successfully if the script exists.
- Expected fail behavior: the command reports that the script is unavailable if `package.json` does not define it.
- No targeted Playwright impact is expected because this PR changes sample palette JSON data only.

## Manual Validation
1. Open each changed `sample.<id>.palette.json` file.
2. Confirm the file is valid JSON.
3. Confirm each swatch has `symbol`, `hex`, and `name`.
4. Confirm optional tags are lowercase arrays of strings.
5. Confirm no sample launch code was modified.
6. Full samples smoke test remains out of scope by instruction.
