# Playwright Active Game Manifest Discovery

## Command
- `npm run test:workspace-v2`

## Result
- PASS
- 11 tests passed.

## Coverage Notes
- Added Playwright coverage for repo-backed Active Game discovery.
- The mocked repo picker returns three schema-valid Workspace Manager V2 `game.manifest.json` files, one invalid manifest, and one missing-manifest game folder.
- Assertions verify:
  - Active Game is empty and disabled before repo selection.
  - Repo selection populates only `Asteroids`, `Gravity Well`, and `Pong`.
  - Active Game remains on the placeholder after discovery.
  - Invalid manifest log includes `games/InvalidWorkspace/game.manifest.json` and the schema validation reason.
  - Missing manifest log includes `games/MissingManifest/game.manifest.json` and is logged as `SKIP`.
  - Switching to a repo missing `games/` clears and disables Active Game.
  - Re-selecting a valid repo repopulates the dropdown without auto-selecting a game.
  - Existing Workspace Manager V2 launch flows still work after discovery.
