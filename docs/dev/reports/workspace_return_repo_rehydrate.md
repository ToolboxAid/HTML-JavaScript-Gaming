# PR_26128_027 Workspace Return Repo Rehydrate

## Scope
- Updated Workspace Manager V2 return-from-tool restore behavior.
- Kept session storage as the integration boundary.
- Preserved normalized `workspace.tools.<tool-id>` session keys.

## Changes
- Workspace Manager V2 now reads `workspace.repo.reference` before restoring a returned `hostContextId`.
- Repo Destination display is repopulated from the session repo reference on valid returns.
- Active Game and tool buttons remain restored only when both the session workspace context and repo reference are valid.
- Missing or invalid repo session references now show an actionable restore failure and keep repo/game/tool controls disabled.
- Added validation for repo reference JSON shape, `source`, `kind`, optional `storageKey`, display name, and manifest repo root compatibility.

## Guardrails
- No sample JSON files modified.
- No roadmap files modified.
- No cross-tool communication added.
- No schema or normalized tool session key shape changes.

## Validation
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` passed.
- `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js` passed.
- `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js` passed.
- Focused missing/invalid repo reference restore test passed.
- Focused Asset/Palette/Preview return flow test passed.
- `npm run test:workspace-v2` passed: 16 tests.

## Full Samples Smoke
- Skipped per PR instructions. The change is limited to Workspace Manager V2 session return restore behavior and targeted Workspace Manager V2 Playwright coverage validates the affected flows.
