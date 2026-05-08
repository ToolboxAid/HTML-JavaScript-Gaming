# PR_26128_006 Active Game Manifest Discovery

## Changes
- Workspace Manager V2 now starts with an empty, disabled Active Game dropdown until a repo folder is selected.
- Repo Destination selection clears the active workspace immediately before loading the newly selected repo.
- Workspace Manager V2 recursively scans the selected repo `games/` tree for `game.manifest.json` files.
- Discovered manifests are validated through the existing Workspace Manager V2 manifest/schema validation path before being added to Active Game.
- Active Game is populated only with schema-valid discovered manifests and remains unselected after discovery.
- Invalid manifests are skipped with visible status log entries that include the manifest path and validation reason.
- Missing direct child game manifests under `games/` are logged as `SKIP`, not `FAIL`.
- Repo load failure leaves Active Game empty and disabled.

## Guardrails
- No `game.manifest.json` files were modified.
- No sample JSON was modified.
- No schema contracts were modified.
- No cross-tool communication was added.
- No repo write behavior was added or changed.
- No session/toolState persistence behavior was added for repo discovery; discovered repo/game state remains in-memory.

## Validation
- `npm run test:workspace-v2` -> PASS, 11 tests.
- Verified Active Game dropdown is empty and disabled before repo selection.
- Verified dropdown clears when repo selection changes.
- Verified dropdown remains disabled on repo load failure.
- Verified only schema-valid discovered `game.manifest.json` entries appear.
- Verified invalid manifests are skipped and logged with exact path/reason.
- Verified missing manifests are logged as `SKIP`, not `FAIL`.
- Verified no default game is auto-selected after discovery.

## Skipped
- Full samples smoke test was skipped by request. This PR is scoped to Workspace Manager V2 manifest discovery and dropdown state; `npm run test:workspace-v2` plus targeted Playwright coverage exercises the affected UI, discovery, validation, and launch handoff behavior.
