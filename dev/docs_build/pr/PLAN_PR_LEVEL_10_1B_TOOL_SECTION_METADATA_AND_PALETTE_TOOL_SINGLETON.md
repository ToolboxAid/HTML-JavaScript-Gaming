# PLAN_PR_LEVEL_10_1B_TOOL_SECTION_METADATA_AND_PALETTE_TOOL_SINGLETON

## Purpose
Correct the Level 10 palette/tool model.

Palette is a first-class tool domain and should live under `tools`, not as an unrelated root-level object.

Primitive Skin Editor must also include normal tool-section metadata.

## Corrections
- Palette belongs under `tools`.
- Palette is a singleton tool section.
- Do not use multiple palettes.
- Do not place palette under Primitive Skin Editor.
- Every tool section must include:
  - schema
  - version
  - name
  - source
- Primitive Skin Editor owns skins only.
- Palette tool owns the single shared palette data.
