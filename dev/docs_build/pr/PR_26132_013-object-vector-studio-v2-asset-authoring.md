# PR_26132_013-object-vector-studio-v2-asset-authoring

## Scope

Expands Object Vector Studio V2 asset authoring only. The work stays inside the Object Vector Studio V2 runtime/schema/test surface and does not change World Vector Studio V2, sample JSON, or deprecated tool behavior.

## Changes

- Added authoring controls for ship, asteroid, UFO, bullet, and pickup object templates.
- Added object category filtering, text search, and thumbnail previews in the Objects accordion.
- Added template duplication into schema-valid durable object assets.
- Added durable shape grouping through optional `groupId` on shape payloads.
- Implemented flatten object by baking non-rotated shape transforms into geometry and blocking rotate-safe flatten with a visible failure.
- Added Export SVG alongside existing Import, Copy JSON, and Export JSON actions.
- Added object bounds visualization, optional rendered grid lines, clearer coordinate text, zoom display, and selection metrics.
- Added shape origin/pivot editing through valid `transform.originX` and `transform.originY` fields.
- Kept palette as a runtime/session resource and object metadata editing limited to schema-valid object fields.

## Validation

Commands run:

- `node --check toolbox/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check toolbox/object-vector-studio-v2/js/bootstrap.js`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=line -g "Object Vector Studio V2"`
- `npm run test:workspace-v2`

Result:

- Targeted Object Vector Studio V2 coverage passed: 3 passed.
- Full Workspace Manager V2 suite passed: 42 passed.
- Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt` and copied to required report path `docs_build/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR is covered by targeted Object Vector Studio V2 and Workspace Manager V2 Playwright validation.

## Coverage

Added Playwright coverage for:

- Template object creation.
- Object tile thumbnail rendering.
- SVG export.
- JSON export and copy JSON.
- Invalid import rejection through schema validation.
- Snap-to-grid behavior.

## Notes

- `groupId` is the only schema addition, and it is scoped to durable shape grouping.
- Palette data remains outside Object Vector Studio V2 exported/copied JSON.
- Rotate-safe geometric flattening remains blocked with an explicit FAIL log instead of silently losing rotation.
