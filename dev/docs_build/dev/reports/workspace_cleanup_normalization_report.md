# Workspace Cleanup Normalization Report

PR: `PR_26140_058-normalize-uat-fixture-and-sample-tool-map`

## Summary
- Renamed the sample link registry from `samples/sample.to.workspace.json` to `samples/samples.to.tools.json`.
- Preserved the tool-focused schema name `html-js-gaming.sample-tool-links/1`.
- Converted the Workspace V2 UAT fixture to the current game manifest direction used by `games/_template/game.manifest.json`.
- Kept UAT fixture data in `tests/fixtures/workspace-v2/`.
- Preserved Workspace Manager V2 launch/save behavior.

## Sample Tool Map
- `samples/samples.to.tools.json` is the active sample/tool registry.
- The registry uses a tool-first structure:
  - `tools.<toolName>[]`
  - each entry includes `sampleId` and `phase`
  - related sample metadata remains on each link, including `sampleType`, `primaryTool`, and `palettePath`
- Validation confirmed 35 sample/tool links and existing palette paths.
- No unrelated sample JSON files were modified.

## UAT Fixture
- `tests/fixtures/workspace-v2/uat.manifest.json` now uses:
  - `$schema: "toolbox/schemas/game.manifest.schema.json"`
  - `schema: "html-js-gaming.game-manifest"`
- Temporary UAT loading now requires a game-manifest-shaped fixture.
- The Workspace Manager V2 runtime still generates the session/toolState context from the UAT game manifest at launch time.
- Playwright coverage now validates the UAT fixture through `validateGameManifest()` and confirms the generated UAT session context loads.

## Active Dependency Audit
- PASS: no active dependency remains on `workspace.manifest.json` in:
  - `tools`
  - `scripts`
  - `tests`
  - `games`
  - `samples`
- PASS: no active dependency remains on `sample.to.workspace.json` in:
  - `tools`
  - `scripts`
  - `tests`
  - `games`
  - `samples`
- PASS: no active dependency remains on `html-js-gaming.workspace-manifest.palette-links/1`.
- Historical docs/roadmaps still contain older terminology and were left untouched.

## Validation
- PASS: targeted JSON parse validation for:
  - `samples/samples.to.tools.json`
  - `tests/fixtures/workspace-v2/uat.manifest.json`
- PASS: targeted syntax/import validation for changed files.
- PASS: sample/tool mapping validation.
- PASS: UAT game manifest validation and temporary UAT load validation.
- PASS: `npm run test:workspace-v2` with 58 passed.
- PASS: active dependency searches for removed schema/path references.
- PASS: `git diff --check`.

## Out Of Scope
- Full samples smoke test was skipped as requested.
- No compatibility shims were added.
- No unrelated sample JSON files were touched.
