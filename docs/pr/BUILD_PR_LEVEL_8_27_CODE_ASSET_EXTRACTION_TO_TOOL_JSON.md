# BUILD_PR_LEVEL_8_27_CODE_ASSET_EXTRACTION_TO_TOOL_JSON

## User Blocker
The repo also has code-based colors, shapes, HUD primitives, vector primitives, and other asset-like constants.

These must be extracted into tool-owned JSON files and then consumed by games/samples as inputs.

## Target Rule

If a value is content/data, it should not live hardcoded in game/sample code.

Examples:
- colors
- palette swatches
- HUD color groups
- primitive skin definitions
- vector shapes
- tile shapes
- sprite definitions
- parallax scene data
- bezel/layout overrides
- test/demo asset constants

## Ownership Rule

Each extracted JSON file must belong to the correct tool/schema:

| Data Type | Owning Tool / Schema |
|---|---|
| colors / swatches | `palette.schema.json` |
| HUD colors / skin colors | Primitive Skin Editor / palette JSON |
| primitive skins | `skin-editor.schema.json` |
| vectors/shapes | Vector Asset Studio / vector schema |
| maps/layouts | Vector Map Editor or Tilemap Studio schema |
| sprites | Sprite Editor schema |
| parallax scenes | Parallax Scene Studio schema |
| overlays/bezel/layout | workspace/game manifest referenced override |

## Required Audit

Codex must scan game/sample source for hardcoded content patterns:

### Color Patterns
- `#RGB`
- `#RRGGBB`
- `#RRGGBBAA`
- `rgb(...)`
- `rgba(...)`
- named color constants

### Shape/Data Patterns
- inline point arrays
- vector line/shape definitions
- HUD layout/color objects
- sprite frame arrays
- tile arrays
- primitive skin objects
- hardcoded asset maps

## Required Reports

Create:

```text
docs/dev/reports/level_8_27_code_asset_extraction_audit.md
docs/dev/reports/level_8_27_extraction_candidate_matrix.md
```

The matrix must include:

| Source File | Hardcoded Data | Type | Proposed Tool Owner | Proposed JSON Path | Safe To Extract Now |
|---|---|---|---|---|---|

## Extraction Rule

Only extract in this PR if:
- the owning schema already exists
- the JSON target path is obvious
- the game/sample already has a manifest/input path to wire it
- no runtime rewrite is required beyond changing an input reference

Otherwise:
- report as follow-up

## Manifest Wiring Rule

When extraction happens:
- add the new JSON to the game/sample SSoT manifest or sample input
- do not leave unreferenced JSON
- do not create duplicate SSoTs

## Roadmap Movement

Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:

Add or advance:
- `[.] Code-defined asset extraction audit`
- `[.] Tool-owned JSON asset input wiring`
- `[.] Hardcoded color/shape removal plan`

Use only:
- `[ ] -> [.]`
- `[.] -> [x]`

## Acceptance
- Code-defined content audit exists.
- Candidate extraction matrix exists.
- Safe extractions are done or explicitly deferred.
- Extracted JSON is wired into game/sample inputs.
- No unreferenced extracted JSON.
- No runtime rewrite.
- No validators.
- No `start_of_day` changes.
