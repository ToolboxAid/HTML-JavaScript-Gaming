# BUILD_PR_LEVEL_10_1_GAME_PALETTE_COMPLETENESS_AND_TOOL_INPUT_ALIGNMENT

## Objective
Ensure every game has the palette data needed for tool alignment.

## Rule
Palettes for games must be manifest-owned data.

Do NOT create:

```text
games/<game>/assets/palettes/*.json
```

Instead, add actual palette data to:

```text
games/<game>/game.manifest.json
```

under the correct tool section.

## Owning Tool
Game palettes should be owned by the appropriate tool section.

Preferred:

```json
"tools": {
  "primitive-skin-editor": {
    "palettes": {
      "palette.<game>.classic": {
        "schema": "html-js-gaming.palette",
        "version": 1,
        "name": "<Game> Classic Palette",
        "swatches": []
      }
    }
  }
}
```

If a game uses palette browsing/editing explicitly, also ensure the palette is compatible with Palette Browser input, but do not duplicate data under Palette Browser.

## Palette Creation Rules

For each game:
1. Inspect `game.manifest.json`.
2. If palette data exists, normalize it.
3. If missing, extract from:
   - hardcoded game colors
   - canvas drawing styles
   - CSS variables/classes
   - old palette files already inlined or removed
   - skin/HUD color constants
4. Generate stable swatches:
   - `symbol` single character
   - `hex` uppercase `#RRGGBB`
   - no opaque `#RRGGBBFF`
5. Do not invent arbitrary colors unless no source exists.
6. If no color source exists, create a minimal explicit fallback palette and document it.

## Tool Input Alignment Rule
Tools should receive manifest slices:

```text
toolInput = gameManifest.tools[toolId]
```

Not:
- file paths to JSON
- sample dropdown data
- separate asset catalog JSON
- workspace asset catalog JSON

## Required Audit Report
Create:

```text
docs/dev/reports/level_10_1_game_palette_completeness_report.md
```

Per game include:
- game id
- palette existed before
- palette created/normalized
- source of colors
- swatch count
- missing/assumed colors
- tool section used
- remaining palette issues

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- add/advance Phase 10 palette completeness item
- add/advance tool input alignment item
- use only `[ ] -> [.]` and `[.] -> [x]`

## Acceptance
- Every game that uses colors has manifest-owned palette data.
- No new palette JSON files are created.
- Palette data lives under owning tool sections.
- Swatches use single-character symbols.
- Opaque alpha `FF` suffixes are removed.
- Tools have a documented manifest-slice input contract.
- No validators added.
- No `start_of_day` changes.
