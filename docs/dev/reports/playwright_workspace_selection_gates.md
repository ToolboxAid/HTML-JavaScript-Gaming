# Playwright Workspace Selection Gates

## Command
`npm run test:workspace-v2`

## Result
PASS: 12 passed

## Targeted Coverage
- Verified initial Workspace Manager V2 load has an empty disabled Active Game dropdown.
- Verified stale sessionStorage does not preselect Asteroids on direct initial load.
- Verified workspace tools are disabled before repo selection.
- Verified repo selection discovers and validates `game.manifest.json` files.
- Verified Active Game enables after valid games are found.
- Verified no game is auto-selected after discovery.
- Verified workspace tools remain disabled until the user manually selects a valid game.
- Verified workspace tools enable after a valid game selection.
- Verified failed repo load clears and disables Active Game and keeps tools disabled.
- Verified no-valid-games discovery keeps Active Game disabled and tools disabled.
- Verified invalid manifests are skipped and logged with exact path and validation reason.

## Skipped
- Full samples smoke test was skipped as requested. The targeted Workspace Manager V2 Playwright suite covers the changed selection gates, repo discovery, invalid-manifest logging, and affected launch gating behavior.
