# BUILD_PR_LEVEL_10_1B_TOOL_SECTION_METADATA_AND_PALETTE_TOOL_SINGLETON

## Problem
The previous correction moved palette to root:

```json
"palette": {
  "schema": "html-js-gaming.palette",
  "version": 1,
  "name": "_template Palette",
  "source": "manifest-and-runtime-color-scan",
  "swatches": []
}
```

That is wrong because palette is a first-class tool/domain.

Also, Primitive Skin Editor sections were missing standard metadata:

```json
"primitive-skin-editor": {
  "skins": []
}
```

## Correct Shape

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
        "source": "manifest-and-runtime-color-scan",
        "swatches": []
      }
    },

    "primitive-skin-editor": {
      "schema": "html-js-gaming.tool.primitive-skin-editor",
      "version": 1,
      "name": "Primitive Skin Editor",
      "source": "manifest",
      "skins": []
    }
  }
}
```

## Rules

### Palette
- Palette lives under `tools["palette-browser"].palette`.
- Exactly one palette per game/workspace.
- No root `palette`.
- No root `palettes`.
- No `tools.*.palettes` collection.
- No duplicate palettes under other tools.

### Primitive Skin Editor
Primitive Skin Editor owns:
- skins
- HUD skins
- primitive style groups
- mappings to palette symbols

Primitive Skin Editor does NOT own:
- palette swatches
- palette definitions
- palette collections

### Tool Section Metadata
Every first-class tool section under `tools` must have:

```json
{
  "schema": "html-js-gaming.tool.<tool-id>",
  "version": 1,
  "name": "<Display Name>",
  "source": "manifest"
}
```

Tool-specific data is added beside those fields.

## Required Migration
For every `games/*/game.manifest.json`:

1. If root `palette` exists:
   - move it to `tools["palette-browser"].palette`
   - remove root `palette`

2. If `tools["primitive-skin-editor"].palettes` exists:
   - move/merge into `tools["palette-browser"].palette`
   - remove `tools["primitive-skin-editor"].palettes`

3. Ensure `tools["primitive-skin-editor"]` has:
   - schema
   - version
   - name
   - source

4. Ensure `tools["palette-browser"]` has:
   - schema
   - version
   - name
   - source
   - palette

5. Normalize palette:
   - one palette only
   - swatches use single-character symbols
   - hex uppercase
   - no opaque alpha `FF`

## Acceptance
- No root `palette`.
- No root `palettes`.
- Exactly one `tools["palette-browser"].palette` per game.
- Primitive Skin Editor has metadata and no palette ownership.
- Every existing tool section has schema/version/name/source.
- No new palette JSON files.
- No validators.
- No `start_of_day` changes.
