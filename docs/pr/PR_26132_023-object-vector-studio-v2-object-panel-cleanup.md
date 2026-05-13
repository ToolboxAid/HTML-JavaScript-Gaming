# PR_26132_023-object-vector-studio-v2-object-panel-cleanup

## Scope

Updates Object Vector Studio V2 object panel layout, z-action button sizing, and durable object identity naming. No unrelated tools and no sample JSON changes.

## Changes

- Moved Add, Rename, Duplicate, and Delete from the Objects accordion to the bottom of the Object accordion.
- Removed the Object Type input, datalist wiring, object type normalization, object type suggestions, and object type payload persistence.
- Kept Object Name and Tag inputs on inline label/input rows.
- Matched z-action button sizing to shape icon buttons in Words and Icons modes for Bring Forward, Send Backward, Bring To Front, Send To Back, Group Shapes, and Ungroup.
- Updated Object Vector Studio V2 durable object identity to `object.<game>.<name>`.
- Updated rename/add flows so object ids remain schema-compliant when object names change.
- Updated Asteroids Object Vector assets to remove object-level `type` fields while preserving shape `type` fields.
- Updated Object Vector Studio V2 schema and runtime validation to reject object-level `type` and non-`object.game.name` ids.
- Updated Object Vector Studio V2 documentation to describe object/game/name identity in object tiles.

## Validation

Playwright impacted: Yes.

Commands run:

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`
- `node --check tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- `node --check src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `node --check tools/object-vector-studio-v2/tests/playwright/FirstClassToolStarter.spec.mjs`
- `node -e "const fs=require('fs'); for (const file of ['tools/schemas/tools/object-vector-studio-v2.schema.json','games/Asteroids/game.manifest.json']) { JSON.parse(fs.readFileSync(file,'utf8')); console.log(file + ' OK'); }"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "Object Vector Studio V2"`
- `npx playwright test --config=tools/object-vector-studio-v2/playwright.config.mjs --workers=1 --reporter=list`
- `npm run test:workspace-v2`
- `git diff --check`

Result:

- Focused Object Vector Studio V2 workspace coverage passed: 6 passed.
- Tool-local Object Vector Studio V2 coverage passed: 4 passed.
- Full Workspace Manager V2 suite passed: 45 passed.
- Playwright V8 coverage refreshed at `docs/dev/reports/playwright_v8_coverage.txt`.
- Full samples smoke test skipped per request; this PR does not modify sample JSON.

## Playwright Coverage

Validates:

- z-action button/icon size parity with shape icon buttons.
- Object actions live at the bottom of the Object accordion.
- Object Type UI is absent.
- Object Name and Tag rows are inline.
- `object.game.name` schema validation rejects old object ids.
- Object-level `type` payload drift is rejected.
- Rename updates the schema-compliant identity id consistently.
- Object Vector asset authoring, animation, inheritance, runtime rendering, and workspace launch flows still load with the new identity contract.

Expected pass behavior:

- Object Vector Studio V2 uses durable object ids shaped as `object.<game>.<name>`, keeps object actions in the Object panel, and rejects old object type/id drift before render.

Expected fail behavior:

- Invalid Object Vector payloads log visible FAIL entries and do not partially render.

## Manual Validation

1. Open `tools/object-vector-studio-v2/index.html`.
2. Import a valid Object Vector Studio V2 payload.
3. Confirm the Object accordion shows inline Object Name and Tag rows and has Add/Rename/Duplicate/Delete at the bottom.
4. Confirm the Objects accordion has no Add/Rename/Duplicate/Delete action row.
5. Toggle Words/Icons and confirm z-action buttons match the shape tool button footprint.
6. Rename an object and confirm JSON Details updates its id to `object.<game>.<renamed-name>`.
7. Try importing a payload with object-level `type` or a bare id such as `ship`; confirm it fails visibly before render.

Expected outcome:

- The Object panel is cleaner, object identity follows the schema naming standard, and old object type payloads are rejected.

## Out Of Scope

- No unrelated tools.
- No sample JSON changes.
- No full samples smoke test.
