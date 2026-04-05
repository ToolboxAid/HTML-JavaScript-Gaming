MODEL: GPT-5.4
REASONING: high

TASK:
Create BUILD_PR_TOOLS_AND_VECTOR_CONTRACT_COMBINED in the HTML-JavaScript-Gaming repo.

GOAL:
In one pass:
1. Consolidate duplicated/renamed tool folders under tools/
2. Repair all affected references and loading paths
3. Validate tool/sample/asset loading
4. Produce the vector asset contract planning docs

IMPORTANT SCOPE:
- Ignore old SpriteEditor as legacy/out-of-scope
- Do not spend effort preserving old SpriteEditor
- Only touch old SpriteEditor if an active reference must be removed or redirected
- Do not introduce unrelated feature work
- Do not perform broad refactors outside tool-folder consolidation, path repair, validation, and vector contract planning

REPO TARGET:
C:\Users\DavidQ\Documents\GitHub\HTML-JavaScript-Gaming

PHASE 1 — TOOLS FOLDER CONSOLIDATION
- Inspect all folders directly under tools/
- Identify duplicate/rename-drift tool folders
- Select one canonical folder per active tool using the newer approved naming
- Consolidate files into canonical folders
- Merge subfolders too, including:
  - html
  - js
  - css
  - samples
  - assets
  - docs
  - config/json
  - shared helpers
- Prefer git-aware moves where practical
- When duplicate files exist in both locations:
  - keep the better/current version
  - manually merge if both contain meaningful changes
  - do not blindly overwrite

PHASE 2 — PATH / REFERENCE REPAIR
Update all references across the repo to canonical tool paths, including:
- imports
- fetch/load paths
- sample JSON paths
- asset references
- README references
- launcher/index links
- internal tool-to-tool references

Pay special attention to:
- Tile Map Editor
- Parallax Editor
- SVG Editor
- vector/json loaders
- sample asset paths
- case consistency in folder names

PHASE 3 — VALIDATION
Validate all of the following:
- launcher/index links resolve
- Tile Map Editor loads
- Parallax Editor loads
- SVG Editor loads
- sample loading works
- assets render/load correctly
- no required references remain to deprecated duplicate folders
- no required runtime references remain to old SpriteEditor
- no obvious broken paths remain after consolidation

PHASE 4 — VECTOR ASSET CONTRACT PLAN
Create planning/spec documentation for the vector asset contract.

Required new spec target:
docs/specs/vector_asset_contract.md

The spec must define at minimum:
- purpose and scope
- canonical vector asset file role
- coordinate system
- origin conventions
- transform expectations
- stroke behavior
- fill/color rules
- palette strategy
- shape primitives supported
- layering expectations
- naming conventions
- runtime expectations
- what the future geometry runtime must support
- explicit non-goals / out-of-scope items

REQUIRED DELIVERABLES:
1. docs/pr/BUILD_PR_TOOLS_AND_VECTOR_CONTRACT_COMBINED.md
2. docs/dev/codex_commands.md
3. docs/dev/commit_comment.txt
4. docs/dev/reports/file_tree.txt
5. docs/dev/reports/change_summary.txt
6. docs/dev/reports/validation_checklist.txt
7. docs/specs/vector_asset_contract.md

BUILD PR DOC MUST INCLUDE:
- canonical tool folders selected
- duplicate folders discovered
- files/folders moved or merged
- references updated
- obsolete folders removed
- explicit note that old SpriteEditor was intentionally excluded except for active reference cleanup
- summary of validation performed
- summary of vector asset contract outputs

OUTPUT RULES:
- Docs-first repo workflow
- Keep changes surgical
- No unrelated implementation work
- Preserve exact repo-relative structure
- Package result as a repo-structured ZIP at:

<project folder>/tmp/BUILD_PR_TOOLS_AND_VECTOR_CONTRACT_COMBINED.zip
