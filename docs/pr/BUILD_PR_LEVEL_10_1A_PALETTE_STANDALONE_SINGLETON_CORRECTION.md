# BUILD_PR_LEVEL_10_1A_PALETTE_STANDALONE_SINGLETON_CORRECTION

## Objective
Fix the palette model.

## Wrong Current Shape

```json
{
  "tools": {
    "primitive-skin-editor": {
      "palettes": {
        "palette.gravitywell.classic": {
          "schema": "html-js-gaming.palette",
          "swatches": []
        }
      }
    }
  }
}
```

## Correct Shape

```json
{
  "palette": {
    "schema": "html-js-gaming.palette",
    "version": 1,
    "name": "Gravity Well Palette",
    "source": "manifest-and-runtime-color-scan",
    "swatches": []
  },
  "tools": {
    "primitive-skin-editor": {
      "skins": []
    }
  }
}
```

## Rules

### Palette
- Root-level `palette`.
- Exactly one per game/workspace.
- Actual JSON data, not a reference.
- No `palettes` collection.
- No tool-owned palette copies.

### Primitive Skin Editor
Primitive Skin Editor owns:
- skins
- HUD skins
- primitive style groups
- skin mappings

Primitive Skin Editor does NOT own:
- palette singleton
- palette browser data

### Palette Browser
Palette Browser may open/read/edit the root `palette`, but does not own a duplicate copy.

### Other Tools
Sprite Editor, Vector Asset Studio, Tile Map Editor, Parallax Editor, etc. consume the same root `palette`.

## Required Migration
For every `games/*/game.manifest.json`:

1. Find:
```json
tools["primitive-skin-editor"].palettes
```

2. If exactly one palette exists:
- move it to root `palette`
- remove `tools["primitive-skin-editor"].palettes`

3. If multiple palettes exist:
- merge into one root `palette`
- dedupe swatches by `hex`
- preserve unique swatch symbols
- if duplicate symbol conflict exists, reassign deterministic single-character symbols
- record merge in report

4. Normalize:
- `#RRGGBBFF` -> `#RRGGBB`
- uppercase hex
- single-character symbol

5. Ensure no:
- root `palettes`
- tool-owned `palettes`
- duplicate palette objects

## Required Report
Create:

```text
docs/dev/reports/level_10_1a_palette_singleton_correction_report.md
```

Report per game:
- palette found under primitive-skin-editor
- palettes moved
- palettes merged
- final swatch count
- duplicate swatches removed
- symbol conflicts fixed

## Roadmap Movement
Update roadmap status only:
- Phase 10 palette singleton correction `[ ] -> [.]` or `[.] -> [x]`

## Acceptance
- Each game manifest has exactly one root `palette`.
- No `tools.*.palettes` remain.
- No root `palettes` collections remain.
- Primitive Skin Editor has no palette ownership.
- Palette Browser has no duplicate palette ownership.
- No new palette JSON files.
- No validators.
- No `start_of_day` changes.
