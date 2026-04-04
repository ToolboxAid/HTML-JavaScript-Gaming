Toolbox Aid
David Quesenberry
04/03/2026
PLAN_PR_PROJECT_ASSET_REGISTRY.md

# PLAN_PR_PROJECT_ASSET_REGISTRY

## Objective
Define a docs-first plan for a project-level asset registry that allows the HTML-JavaScript-Gaming toolchain to reference shared assets consistently across Sprite Editor, Tile Map Editor, and Parallax Editor without changing engine core APIs.

## Why this PR exists
The prior Sprite Editor project-integration work establishes project awareness and palette persistence. The next architectural step is to introduce a project asset registry contract so tools can discover, reference, and reuse:
- palettes
- sprite sheets / sprite assets
- tile images / tile sets
- parallax layer image sources
- future shared project media metadata

This PR is planning-only. Codex will implement in a follow-up BUILD PR.

## Goals
1. Define a stable project-level asset registry format.
2. Define how editors read/write registry entries.
3. Preserve backward compatibility for existing isolated tool files.
4. Avoid engine-core API changes.
5. Reduce duplicated asset definitions across editors.
6. Support project-scoped relative paths and future validation tooling.

## Non-Goals
- No implementation code in this PR.
- No engine runtime asset loader rewrite.
- No destructive migration of existing project files.
- No mandatory conversion of all current samples.
- No breaking schema change for existing editor save files.

## Proposed scope
### In scope
- registry document location and naming
- registry schema proposal
- registry ownership rules
- per-tool integration expectations
- compatibility and migration rules
- save/load/update behavior expectations
- manual validation targets for the later BUILD PR

### Out of scope
- runtime engine consumption changes
- full auto-migration utility
- remote asset fetching
- binary packing / bundling system
- thumbnail generation

## Proposed file locations
Likely implementation targets for Codex to evaluate:
- `tools/SpriteEditorV3/`
- `tools/Tilemap Studio/`
- `tools/Parallax Scene Studio/`
- shared project utilities under an existing non-engine tool utility area if present
- project sample data files under tool samples or shared project asset samples
- docs/pr/
- docs/dev/reports/

## Proposed asset registry contract
### Canonical registry file
Recommended project-level file:
- `project.assets.json`

Alternative acceptable if existing project model already has a central project file:
- embed `assets` block in the existing project JSON

Preferred default: separate `project.assets.json` to keep asset references isolated from editor-specific state.

### Top-level registry shape
```json
{
  "version": 1,
  "projectId": "sample-project",
  "basePath": ".",
  "palettes": [],
  "sprites": [],
  "tilesets": [],
  "images": [],
  "parallaxSources": [],
  "references": {}
}
```

### Registry principles
1. Registry entries must use project-relative paths.
2. Registry must be human-readable and hand-editable.
3. Each asset entry must have a stable `id`.
4. Editors may add entries but should not remove unrelated entries silently.
5. Unknown entry fields must be preserved when practical.
6. Editors must tolerate missing registry file and degraded legacy mode.

## Asset type expectations
### Palettes
Each palette entry should support:
- `id`
- `name`
- `colors` array
- optional `lockedDefaultIndex`
- optional `sourceTool`
- optional `tags`

### Sprites
Each sprite entry should support:
- `id`
- `name`
- `path`
- optional `paletteId`
- optional dimensions
- optional tags / category
- optional metadata for animation grouping

### Tilesets
Each tileset entry should support:
- `id`
- `name`
- `path`
- optional tile width / height
- optional paletteId
- optional source image metadata

### Images
Generic image entries support shared image references used by multiple editors.

### Parallax sources
Parallax entries may reference image ids rather than duplicate raw paths when possible.

## Cross-tool reference contract
### Sprite Editor
- May create/update sprite records.
- May create/update palette records tied to sprite work.
- Must store palette reference by `paletteId` when a shared palette is intended.
- Must preserve locked-palette behavior defined in the previous PR.
- Must continue to load legacy sprite files without registry presence.

### Tile Map Editor
- May reference sprite or tile assets from registry.
- May create/update tileset records.
- Should prefer registry ids over duplicated direct paths once project mode is enabled.
- Must allow legacy direct-path tile maps to continue functioning.

### Parallax Editor
- May reference `images` and `parallaxSources` registry sections.
- Should avoid duplicating identical image paths across layers/projects where registry ids are available.
- Must preserve existing sample compatibility.

## Ownership and write rules
1. Editors only mutate the sections they own unless explicitly performing a merge-safe shared update.
2. Shared assets such as palettes may be updated by Sprite Editor and other palette-aware tools, but merge rules must avoid destructive overwrite.
3. Registry writes should be deterministic and stable in ordering where practical.
4. Writes should preserve unknown sections and unknown fields when practical.

## Legacy compatibility contract
### No-registry projects
If `project.assets.json` does not exist:
- tools continue in legacy standalone mode
- tools may prompt or offer optional project-registry creation
- no save/load operation should fail solely due to absent registry

### Existing standalone files
Existing files with direct paths or embedded palette state remain loadable.

### Transition behavior
Acceptable transitional strategy:
- first load legacy file
- detect project mode
- offer non-destructive “register assets” action or silent additive registration only when safe

## Save/load behavior contract
### Save
When project mode is active:
- editor saves its native document
- registry is updated additively if shared assets are introduced or modified
- existing unrelated registry entries remain intact

### Load
When project mode is active:
- editor resolves shared asset ids through registry first
- if missing, falls back to legacy embedded/direct path data
- missing registry entries should surface a warning state, not hard crash

## Path normalization contract
- Use forward-slash style project-relative paths in saved project registry data.
- Avoid absolute local machine paths.
- Preserve display names separately from resolved paths.
- Normalize duplicate equivalent paths before creating new entries where practical.

## Duplicate prevention contract
Codex should plan for implementation rules that reduce duplicate entries:
- match by existing id when present
- otherwise compare normalized path + type
- avoid creating multiple palette entries with identical ids
- prefer additive merge over replacement

## Suggested schema sketch
```json
{
  "version": 1,
  "projectId": "demo",
  "basePath": ".",
  "palettes": [
    {
      "id": "palette.mario-basic",
      "name": "Mario Basic",
      "colors": ["#000000", "#ffffff", "#ff0000"],
      "sourceTool": "sprite-editor"
    }
  ],
  "sprites": [
    {
      "id": "sprite.hero.idle",
      "name": "Hero Idle",
      "path": "assets/sprites/hero-idle.json",
      "paletteId": "palette.mario-basic"
    }
  ],
  "tilesets": [
    {
      "id": "tileset.overworld",
      "name": "Overworld",
      "path": "assets/tiles/overworld.png",
      "tileWidth": 16,
      "tileHeight": 16
    }
  ]
}
```

## Risks / edge cases to guard against
- silent overwrite of unrelated registry sections
- registry duplication from repeated imports
- palette id drift after rename/save-as
- legacy files breaking when registry is absent
- path separator inconsistencies across OSes
- import/duplicate/resize flows accidentally generating invalid ids
- editor-specific assumptions leaking into shared registry design

## BUILD PR expectations
The BUILD PR should:
1. Add registry read/write utilities in tool-safe locations.
2. Integrate Sprite Editor with palette/sprite registry sections.
3. Integrate Tile Map Editor with tileset/image references.
4. Integrate Parallax Editor with image/parallax references.
5. Keep engine runtime untouched unless a later approved PR explicitly expands scope.
6. Preserve backward compatibility.
7. Include sample project data demonstrating cross-tool references.

## Manual validation checklist for BUILD PR
- Create new project-aware sprite asset and verify registry entry creation.
- Save/load sprite with shared palette id preserved.
- Load existing legacy sprite with no registry and verify no break.
- Register a tileset and verify Tile Map Editor reads it without duplicating entries.
- Register parallax image source and verify Parallax Editor resolves shared entry.
- Repeat save on multiple tools and verify unrelated registry sections survive.
- Verify project-relative paths only; no absolute paths saved.
- Verify duplicate import does not create obvious duplicate entries.
- Verify missing registry entry degrades with warning, not crash.
- Verify old samples still load.

## Likely follow-up BUILD PR name
- `BUILD_PR_PROJECT_ASSET_REGISTRY`

## Codex build command
```text
MODEL: GPT-5.4
REASONING: high
COMMAND:
Create BUILD_PR_PROJECT_ASSET_REGISTRY docs-first implementation bundle.

Requirements:
- Implement project-level asset registry support for Sprite Editor, Tile Map Editor, and Parallax Editor
- Prefer separate project.assets.json unless repo conventions require embedding in existing project file
- Preserve legacy standalone file compatibility
- Do not modify engine core APIs
- Use project-relative normalized paths
- Add additive, non-destructive registry merge behavior
- Avoid duplicate asset entries where practical
- Include sample project data showing shared palette/sprite/tileset/parallax references

Validation:
- All manual checklist items in validation_checklist.txt must pass

Package:
- Output delta zip to HTML-JavaScript-Gaming/tmp/BUILD_PR_PROJECT_ASSET_REGISTRY_delta.zip
```

## Commit comment
`docs: plan project asset registry for cross-tool shared asset references`

## Next command
```text
next: BUILD_PR_PROJECT_ASSET_REGISTRY
```
