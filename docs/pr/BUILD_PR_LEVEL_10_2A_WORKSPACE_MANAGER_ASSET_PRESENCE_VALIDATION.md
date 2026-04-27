# BUILD_PR_LEVEL_10_2A_WORKSPACE_MANAGER_ASSET_PRESENCE_VALIDATION

## Objective
Upgrade the Workspace Manager game-open test from "loads without diagnostic" to "loads with expected data present."

## Required Test Enhancements

The test must still validate:
- games are discovered from `games/index.html`
- "Open with Workspace Manager" uses `gameId=<id>`
- query includes `mount=game`
- no legacy `?game=` query
- no diagnostic page

But it must also validate that the Workspace Manager loaded the expected game data.

## Required Asset Presence Checks

For each game opened in Workspace Manager:

### 1. Shared Palette
Fail if Workspace Manager shows:

```text
Shared Palette: No shared palette selected
```

Expected:
- a shared palette exists
- palette name or swatch count is visible
- root/tool singleton palette is loaded from `game.manifest.json`

### 2. Primitive Skin / Skin Data
If the game has skin data in its manifest, verify it is visible under shared assets or the Primitive Skin Editor section.

For Bouncing-ball, this must include:

```text
Bouncing Ball Classic Skin
```

But that alone is not enough if palette is missing.

### 3. Shared Assets
Verify at least one expected shared asset/tool section is present per game.

Examples:
- palette
- skin
- audio
- image
- vector
- sprite
- tilemap
- parallax

### 4. Manifest Data Contract
The test should verify the loaded Workspace Manager state is not just shell-ready. It must include game-owned manifest data.

Bad/passive-only state:

```text
shared workspace shell ready
Workspace: Loaded
Shared Palette: No shared palette selected
```

This should fail when the game manifest has a palette.

## Test Source
Update or create:

```text
tests/runtime/GamesIndexWorkspaceManagerOpen.test.mjs
```

or equivalent from Level 10.2.

## Suggested Assertions

For each game:

```text
workspaceLoaded === true
diagnosticVisible === false
hasSharedPalette === true
hasExpectedAssetSections === true
```

If a game manifest has no palette, the test may report it as a manifest data issue, but the preferred Phase 10 rule is:
- every game using colors should have one palette

## Required Report
Create/update:

```text
docs/dev/reports/level_10_2a_workspace_manager_asset_presence_validation_report.md
```

Report per game:
- open action valid
- diagnostic absent
- workspace loaded
- shared palette present
- skin present if expected
- shared asset count/sections
- failures

## Bouncing-ball Regression
Specifically assert Bouncing-ball does not show:

```text
Shared Palette: No shared palette selected
```

after opening through Workspace Manager.

## Acceptance
- Test fails when Workspace Manager opens but required game data is missing.
- Bouncing-ball missing palette condition is caught.
- All games from index are checked.
- Existing direct launch behavior remains unchanged.
- No validators added.
- No `start_of_day` changes.
- Delta ZIP returned.
