# BUILD_PR_LEVEL_10_2B_WORKSPACE_MANAGER_PALETTE_BINDING_FIX

## Objective
Make Workspace Manager load the game's singleton palette as the shared palette.

## Expected Manifest Palette Location
Current model:

```json
{
  "tools": {
    "palette-browser": {
      "schema": "html-js-gaming.tool.palette-browser",
      "version": 1,
      "name": "Palette Browser",
      "source": "manifest",
      "palette": {
        "schema": "html-js-gaming.palette",
        "version": 1,
        "name": "Game Palette",
        "swatches": []
      }
    }
  }
}
```

## Required Behavior
When opening:

```text
/tools/Workspace%20Manager/index.html?gameId=<id>&mount=game
```

Workspace Manager must:
1. Load `games/<game>/game.manifest.json`.
2. Read:
   ```text
   tools["palette-browser"].palette
   ```
3. Bind it as the shared palette.
4. Display its name/swatch count instead of:
   ```text
   Shared Palette: No shared palette selected
   ```

## Fallback Compatibility
If older manifests still have root `palette`, Workspace Manager may read it temporarily as compatibility, but the preferred source is:

```text
tools["palette-browser"].palette
```

Do not create a new root palette.

## Tests
Run/update the Level 10.2A test so it catches:
- Bouncing-ball missing shared palette
- any other game missing shared palette despite manifest palette existing

## Acceptance
- Bouncing-ball no longer shows `Shared Palette: No shared palette selected`.
- Games with manifest palettes show shared palette as loaded.
- Level 10.2A test passes or reports only games genuinely missing palette data.
- No direct launch regression.
- No validators added.
- No start_of_day changes.
