# PR_26133_001 Workspace V2 Results

## Command Results

- `node --check tools/object-vector-studio-v2/js/ToolStarterApp.js`: passed.
- `node --check tools/object-vector-studio-v2/js/bootstrap.js`: passed.
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`: passed.
- `node -e` JSON parse for `games/Asteroids/game.manifest.json` and `tools/schemas/tools/object-vector-studio-v2.schema.json`: passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "shows Object Vector Studio V2 layout shell"`: 1 passed.
- `npm run test:workspace-v2`: 45 passed.
- `git diff --check`: passed.

## Targeted Object Vector Studio V2 Verification

- Standalone Object Vector Studio V2 Playwright manual pass reported `consoleErrors: []` and `pageErrors: []`.
- Object selection preserved left-panel and Objects accordion scroll: before `{ leftPanel: 30, objects: 36 }`, after `{ leftPanel: 30, objects: 36 }`.
- Shape selection preserved left-panel and Objects accordion scroll: before `{ leftPanel: 30, objects: 36 }`, after `{ leftPanel: 30, objects: 36 }`.
- Shape/Tools content reached its accordion bottom.
- Object Name and Tag rows were inline.
- Shape row density measured `11.2px` font size and `22px` row height.
- Left panel was scrollable during the verification pass.

## Contract Checks

- `objectType` UI controls remain absent from Object Vector Studio V2.
- Object-level `type` drift remains rejected by the Object Vector Studio V2 schema path.
- Exact Asteroids Object Vector `asteroids` tag search found no persisted tag values.
- Existing Object Vector Studio V2 payload contracts remain schema-first with no `imageDataUrl` persistence.
