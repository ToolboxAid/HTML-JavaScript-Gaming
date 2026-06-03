# Playwright Workspace Return Repo Rehydrate

## Targeted Coverage
- Verified return from Asset Manager V2 repopulates Repo Destination from `workspace.repo.reference`.
- Verified return from Palette Manager V2 repopulates Repo Destination from `workspace.repo.reference`.
- Verified return from Preview Generator V2 repopulates Repo Destination from `workspace.repo.reference`.
- Verified Active Game remains selected after valid returns.
- Verified tool buttons remain enabled after valid repo/game return hydration.
- Verified missing repo session reference shows an actionable Workspace Manager V2 restore failure.
- Verified malformed repo session reference also blocks restore and keeps controls disabled.

## Commands
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `node --check toolbox/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `node --check toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "blocks Workspace Manager V2 return restore"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "exports manifests and launches tools from fixed Workspace Manager V2 tiles"`
- `npm run test:workspace-v2`

## Result
- Focused restore failure validation passed.
- Focused return rehydration flow passed.
- Full workspace-v2 Playwright validation passed: 16 tests.

## Full Samples Smoke
- Skipped per PR instructions because the requested change is scoped to Workspace Manager V2 return-from-tool session restoration.
