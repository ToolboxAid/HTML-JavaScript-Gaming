# Level 8.26 Unused JSON Audit Report

## Scope
Audited deletion candidates and broader `tools/**/*.json` usage with repository text/reference checks (imports, scripts, docs, tests, samples, games, tool metadata references).

## Candidate Audit Results

### Explicit Candidate Paths
- `tools/codex/sample_maaping_example.json`
  - Result: file not present in current repo (no deletion action).

- `tools/dev/checkPhase24*`
  - `tools/dev/checkPhase24CloseoutExecutionGuard.baseline.json`: referenced by guard script/report content.
  - `tools/dev/checkPhase24CloseoutExecutionGuard.mjs`: referenced by npm script and report content.
  - Decision: keep.

- `tools/dev/checkSharedExt*.json`
  - `tools/dev/checkSharedExtractionGuard.baseline.json`: referenced by guard script/docs.
  - Decision: keep.

- `tools/samples/*`
  - Result: no JSON files found.

- `tools/shared/samples/*`
  - JSON files under `tools/shared/samples/project-asset-registry-demo` are referenced by:
    - `scripts/validate-asset-ownership-strategy.mjs`
    - docs/reports history and validation docs.
  - Decision: keep.

### Other Unused JSON Under `tools/`
- Audit result: no additional JSON file in `tools/` was proven unreferenced under required search scope.
- Deletion action in this PR: none.

## Palette Opaque Alpha Normalization
Rule applied:
- `#RRGGBBFF` -> `#RRGGBB`
- preserve `#RRGGBBAA` when `AA != FF`

Files updated:
- `games/vector-arcade-sample/assets/data/palettes/vector-native-primary.palette.json` (4 values)
- `tools/templates/vector-native-arcade/assets/data/palettes/vector-native-primary.palette.json` (4 values)

Total updated values: 8

## Follow-up Plan (No UI Rewrite in This PR)
### Goal
Remove tool-local sample dropdown/select patterns and standardize sample ownership under `/samples/phase-*`.

### Proposed follow-up execution
1. Inventory tools that render sample dropdown/select UI controls.
2. Map each dropdown option to canonical `/samples/phase-*` entries.
3. Add/normalize sample launch links to `/samples` pages only.
4. Remove tool-local sample selector UI once parity is verified.
5. Migrate any remaining tool-local sample payload/data into `/samples/phase-*` with manifest linkage.
6. Add regression checklist to confirm tool behavior unaffected by selector removal.

## Safety/Scope Compliance
- No runtime JS logic rewritten.
- No validator modules added.
- No `start_of_day` files modified.
