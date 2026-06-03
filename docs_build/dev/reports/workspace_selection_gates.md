# PR_26128_009 Workspace Selection Gates

## Summary
- Workspace Manager V2 now ignores stale stored workspace context on plain initial load.
- Explicit `hostContextId` URLs still restore workspace context for the existing return-from-tool flow.
- Active Game remains empty and disabled on initial load.
- Tools remain disabled before repo selection, after repo discovery, after failed repo load, and when no valid games are found.
- Tools enable only after the user manually selects a valid discovered game.

## Selection Flow
- User selects a repo folder.
- Workspace Manager V2 recursively scans `games/` for `game.manifest.json`.
- Each discovered game manifest validates against the dedicated game manifest schema.
- Invalid manifests are skipped and logged with exact path and reason.
- Active Game enables only when one or more valid games are found.
- No game is auto-selected after discovery.
- The user manually selects a game before workspace tools become enabled.

## Scope Notes
- `game.manifest.json` remains the only required game project manifest.
- No separate `workspace.manifest.json` was introduced.
- No sample JSON was modified.
- No roadmap content was modified.
- No cross-tool communication was added.
- Full samples smoke test was skipped because this BUILD requested targeted Workspace Manager V2 validation and explicitly said to skip full samples smoke.

## Validation
- PASS: `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- PASS: `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS: `npm run test:workspace-v2` - 12 passed
