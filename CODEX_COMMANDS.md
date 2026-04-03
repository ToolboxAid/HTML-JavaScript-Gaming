Toolbox Aid
David Quesenberry
04/03/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH.

Hard requirements:
1. Assume there is NO usable sprite editor in the repo.
2. DO NOT review, assess, refactor, migrate, or depend on any existing sprite editor implementation.
3. DO NOT delete, rename, overwrite, or clean up any current sprite-editor-related files or folders, even if they appear broken, old, duplicate, or unused.
4. Build a NEW sprite editor from scratch as an isolated tool under:
   tools/Sprite Editor/
5. Keep the PR small and surgical, focused only on the new tool and its supporting docs.
6. Follow repo rules:
   - PLAN_PR -> BUILD_PR -> APPLY_PR
   - docs-first
   - one PR per purpose
   - no destructive changes
   - update docs with the change
7. All NEW files must include the required file header standard at the top, using the file creation date.
8. Preserve current repo structure and public/internal boundaries.

Deliverables to create:
- docs/pr/BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH.md
- CODEX_COMMANDS.md
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree.txt

Implementation target:
Build a brand-new browser-based Sprite Editor tool that can stand alone and be opened from the repo tools area.

Minimum feature set:
- Create new sprite canvas
- Grid on/off
- Configurable canvas width/height in pixels
- Configurable pixel size / zoom
- Pencil tool
- Eraser tool
- Fill tool
- Color palette with active color selection
- Recent color swatches
- Frame support for basic animation:
  - add frame
  - duplicate frame
  - delete frame
  - next/previous frame
- Onion-skin preview toggle
- Import PNG into a frame
- Export PNG for current frame
- Export sprite sheet for all frames
- Save/load editor project as JSON
- Transparent background support
- Mouse-friendly editing with visible selected tool/state
- Simple preview panel for animation playback with FPS control

Integration constraints:
- Add a link for the new tool in tools/index.html
- Do not modify engine code unless absolutely required; prefer zero engine changes
- Do not change unrelated tools
- Do not touch samples unless needed for a tiny non-destructive launch link or docs reference
- No deletion of existing assets, tools, or folders

Build guidance:
- Use plain HTML/CSS/JavaScript consistent with repo conventions
- Keep code readable and modular
- Prefer local utility modules within tools/Sprite Editor/
- No external dependencies unless already standard for the repo
- Favor simple data contracts so future Tile Map Editor / Parallax Editor integration is possible

Validation:
- Tool opens directly in browser
- Can draw pixels and erase
- Can add multiple frames
- Can save JSON and reload it
- Can import PNG and export PNG
- Can export a sprite sheet
- Tool link appears in tools/index.html
- Existing repo content remains untouched

Packaging:
Produce a repo-structured delta ZIP at:
<project folder>/tmp/BUILD_PR_SPRITE_EDITOR_FROM_SCRATCH_delta.zip

Include only files relevant to this PR in the ZIP.
Do not include unrelated files, dependencies, or full-repo copies.

At completion also provide:
- commit comment
- next command
