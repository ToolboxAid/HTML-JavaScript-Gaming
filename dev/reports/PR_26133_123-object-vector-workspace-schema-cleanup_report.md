# PR_26133_123 Object Vector Workspace Schema Cleanup Report

## Scope
- Fixed Workspace Manager V2 Object Vector Studio V2 payload synthesis so workspace contexts, tool session hydration, saved context persistence, imports, saves, and launches only carry `version`, `toolId`, `name`, and `objects`.
- Preserved Object Vector Studio V2 `objects[].tags` and `objects[].shapes[]` as the active geometry SSoT.
- Added an actionable Object Vector Studio V2 import/schema failure for legacy root `vectorMaps`.
- Updated targeted Workspace Manager V2/Object Vector validation to assert canonical payload keys and no workspace-launched `vectorMaps`.

## Files Changed
- `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- `tests/tools/WorkspaceManagerV2ObjectVectorPayloadCleanup.test.mjs`
- `tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

## Validation
- PASS: `node -e "import('./tests/tools/WorkspaceManagerV2ObjectVectorPayloadCleanup.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS WorkspaceManagerV2ObjectVectorPayloadCleanup'))"`
- PASS: `node -e "import('./tests/tools/ObjectVectorStudioV2DeleteCleanup.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS ObjectVectorStudioV2DeleteCleanup'))"`
- PASS: `node -e "import('./tests/games/AsteroidsValidation.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsValidation'))"`
- PASS: `node -e "import('./tests/games/AsteroidsAssetReferenceAdoption.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsAssetReferenceAdoption'))"`
- PASS: `node -e "import('./tests/games/AsteroidsPlatformDemo.test.mjs').then((m)=>m.run()).then(()=>console.log('PASS AsteroidsPlatformDemo'))"`
- PASS: `node -e "const fs=require('fs'); ['toolbox/schemas/workspace.manifest.schema.json','toolbox/schemas/game.manifest.schema.json','toolbox/schemas/tools/object-vector-studio-v2.schema.json','games/Asteroids/game.manifest.json'].forEach((p)=>JSON.parse(fs.readFileSync(p,'utf8'))); console.log('PASS JSON parse schemas and Asteroids manifest');"`
- PASS: `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows Object Vector Studio V2 layout shell and schema-only palette gate|uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
- PASS: `git diff --check`

## Coverage
- PASS: Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- PASS: Changed runtime JS guardrail generated at `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.
- Coverage guardrail: `toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js` 83%, `toolbox/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js` 93%, no changed runtime JS coverage warnings.

## Full Samples Smoke Test
- Skipped by request. This PR is limited to Object Vector Studio V2 schema/workspace launch cleanup and targeted Asteroids manifest validation.

## Manual Validation
1. Open Workspace Manager V2.
2. Pick the repo folder and select Asteroids.
3. Confirm the generated Workspace JSON has `tools.object-vector-studio-v2` with only `version`, `toolId`, `name`, and `objects`.
4. Launch Object Vector Studio V2 and confirm the status log reports 7 loaded objects with no `vectorMaps` in JSON details.
5. Import an Object Vector Studio V2 JSON containing root `vectorMaps` and confirm the failure explains to remove `root.vectorMaps` and use `root.objects[].tags` plus `root.objects[].shapes`.
