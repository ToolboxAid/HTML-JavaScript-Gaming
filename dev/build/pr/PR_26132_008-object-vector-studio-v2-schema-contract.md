# PR_26132_008-object-vector-studio-v2-schema-contract

## Purpose

Create the Object Vector Studio V2 JSON Schema contract and make it the runtime acceptance gate.

## Scope

- Added `src/shared/schemas/tools/object-vector-studio-v2.schema.json`.
- Derived the schema shape from SVG Asset Studio palette/vector authoring state and Vector Map Editor object, point, style, and transform document contracts.
- Schema covers Object Vector Studio V2 root payloads, palette swatches, objects, shapes, transform data, selection state, viewport state, and JSON export metadata.
- Root payloads now reject unknown root properties.
- Object/shape payloads are rejected before render through schema validation.
- Workspace/session launches require a palette-backed payload before render.
- Import, Copy JSON, and Export JSON flows validate against the schema contract.
- Runtime now loads the schema file and uses the schema service as the only payload acceptance gate.
- Did not modify World Vector Studio V2 or deprecated SVG Asset Studio, Primitive Skin Editor, or Vector Map Editor.

## Validation

Playwright impacted: Yes.

Command run:

```powershell
npm run test:workspace-v2
```

Result:

```text
39 passed
```

Additional checks:

```powershell
node --check toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
node --check toolbox/object-vector-studio-v2/js/ToolStarterApp.js
node --check toolbox/object-vector-studio-v2/js/bootstrap.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('fs').readFileSync('src/shared/schemas/tools/object-vector-studio-v2.schema.json','utf8')); console.log('schema json ok')"
```

All checks passed.

## Playwright Coverage

The Workspace Manager V2 suite now validates:

- Valid Object Vector Studio V2 schema payload import and render.
- Unknown root property rejection.
- Invalid shape payload rejection through schema validation before render.
- Missing palette rejection from workspace/session launch.
- Copy JSON writes a schema-valid Object Vector Studio V2 payload.
- Export JSON downloads a schema-valid Object Vector Studio V2 payload.

Expected pass behavior:

- Valid payloads with palette, objects, and schema-valid shapes load and render.
- Copy and export payloads validate against the Object Vector Studio V2 schema.

Expected fail behavior:

- Unknown root properties, missing workspace/session palette, and invalid shape payloads log `FAIL` and do not partially render.

## V8 Coverage

Required V8 coverage reports:

```text
docs_build/dev/reports/playwright_v8_coverage_report.txt
docs_build/dev/reports/playwright_v8_coverage.txt
docs_build/dev/reports/coverage_changed_js_guardrail.txt
```

Changed runtime JavaScript coverage includes:

```text
(80%) toolbox/object-vector-studio-v2/js/bootstrap.js
(89%) toolbox/object-vector-studio-v2/js/ToolStarterApp.js
(94%) toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js
```

The coverage guardrail reported no changed-runtime-JS warnings.

## Full Samples Smoke Test

Skipped. This PR is limited to Object Vector Studio V2 schema/runtime gate behavior and targeted Workspace Manager V2 Playwright coverage. It does not change shared sample loading or broad sample runtime behavior.

## Manual Test Steps

1. Open `toolbox/object-vector-studio-v2/index.html`.
2. Confirm Status Log reports the schema contract loaded.
3. Import a valid payload with `palette.swatches` and `objects[]`; confirm object tiles render.
4. Import a payload with an unexpected root property; confirm it is rejected and nothing partially renders.
5. Launch with workspace/session payload missing `palette`; confirm it is rejected.
6. After loading a valid payload, use Copy JSON and Export JSON and validate the output against `object-vector-studio-v2.schema.json`.

## Out Of Scope

- World Vector Studio V2 changes.
- Deprecated SVG Asset Studio, Primitive Skin Editor, or Vector Map Editor runtime changes.
- Workspace manifest write-back for Object Vector Studio V2.
- Full samples smoke test.
