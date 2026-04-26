# BUILD_PR_LEVEL_8_26_MANIFEST_SSOT_AND_UNUSED_JSON_AUDIT

## User Blockers Added

### Root / Manifest Questions
1. Why does root `workspace.manifest.json` still contain `samples`?
2. What is root `package-lock.json` for?
3. Is root `package.json` only unit-test related; should it move under `tests/`?
4. What is the difference between `tools.manifest.json` and `workspace.asset-catalog.json`?
5. We agreed on a single manifest passed to Workspace Editor, then opened with Workspace Manager. Confirm or correct.

### Asteroids / Games Questions
6. Should `bezel.stretch.override.json` be in the manifest for SSoT?
7. Should `asteroids-classic.palette.json` and `hud.json` be in the manifest, including the Primitive Skin Editor section?
8. Should game asset folders avoid `assets/<tool>/data/` and instead use only `assets/<tool>/<asset>` if valid?
9. Apply the same questions/issues to all game folders.
10. Palette swatches should not end with `FFFFFFFF` when `FFFFFF` is sufficient.

### Tool Launch / Palette Browser Question
11. Why does `sample.0213.palette-browser.json` exist when `sprite-editor.json` does not need a palette-browser file?
12. Confirm that `palette-browser` is a tool payload, while `sample.<id>.palette.json` is shared data. Tool payloads should only exist for tools that the sample explicitly launches.

### Deletion / Cleanup Questions
13. Can delete `tools/codex/sample_maaping_example.json`?
14. Can delete `tools/dev/checkPhase24*` and `tools/dev/checkSharedExt*.json`?
15. Can delete `tools/samples/*`?
16. Can delete `tools/shared/samples/*`?
17. Audit the rest of `tools/` and any unused JSON files; delete only if not used.
18. Remove all sample dropdown/select support in tools. Samples should only live under `/samples`.
19. If a sample only lives inside a tool folder, migrate it to the correct `/samples/phase-*` folder.
20. Files should be used by a sample or game. If not wired, wire it or mark it for deletion.

## Initial Answers / Decisions

### 1. Root `workspace.manifest.json` with samples
This is a blocker. Samples should not live in root workspace manifest. Root workspace manifest should be workspace/game focused. Sample catalog data should move to a sample-owned catalog or be derived from `/samples`.

### 2. Root `package-lock.json`
This is the npm lockfile. It pins exact dependency versions for reproducible installs. It belongs at repo root if the root `package.json` is the npm project entry point.

### 3. Root `package.json`
Root `package.json` is not itself a unit test. It is the Node/npm project definition and script runner. It can define test scripts, build scripts, audit scripts, and dependencies. It should stay at root unless the repo becomes a multi-package workspace. Test files belong in `tests/`; root `package.json` should remain the command entry point.

### 4. `tools.manifest.json` vs `workspace.asset-catalog.json`
Current split appears to be:
- `tools.manifest.json`: tool/source metadata mapping runtime assets to source tool data.
- `workspace.asset-catalog.json`: asset catalog consumed by workspace/workspace manager.

This creates SSoT confusion. Decision for audit:
- propose a single game/workspace manifest as SSoT.
- either merge both concepts into one manifest or clearly mark one generated/derived from the other.

### 5. Single manifest into Workspace Editor / Open with Workspace Manager
Preferred target:
- one game/workspace manifest per game/project
- Workspace Editor opens that manifest
- Workspace Manager uses the same manifest
- tool payload/data refs are listed in that manifest, not split across competing catalogs.

### 6–9. Asteroids and all games
Yes, if files are part of the game/workspace asset graph, they should be referenced from the manifest SSoT:
- bezel override
- palettes
- HUD/skin data
- Primitive Skin Editor data
- vectors/sprites/tilemaps/parallax/assets

### 10. Palette hex alpha suffix
Normalize `#RRGGBBFF` to `#RRGGBB` when alpha is fully opaque. Preserve alpha only when not `FF`.

### 11–12. Palette browser vs palette data
`sample.0213.palette-browser.json` exists only because that sample launches the Palette Browser tool. It is a tool payload. `sample.0213.palette.json` is shared data. Sprite editor does not need a palette-browser payload unless the sample launches Palette Browser too.

## Required Codex Work

### A. Manifest SSoT Audit
Create a report comparing:
- `games/**/assets/tools.manifest.json`
- `games/**/assets/workspace.asset-catalog.json`
- any game/workspace project JSON

For each game:
- list files referenced by each manifest/catalog
- list files not referenced
- list duplicate/overlapping references
- recommend one SSoT target

Do not merge yet unless safe and obvious.

### B. Workspace/Samples Split
Apply or confirm PR 8.25:
- root `workspace.manifest.json` has no `samples`
- sample catalog no longer belongs in workspace manifest

### C. Game Asset Wiring Audit
For all games:
- list JSON assets not referenced by the game/workspace manifest SSoT
- specifically include Asteroids:
  - `games/Asteroids/assets/images/bezel.stretch.override.json`
  - `games/Asteroids/assets/palettes/asteroids-classic.palette.json`
  - `games/Asteroids/assets/palettes/hud.json`

### D. Folder Shape Audit
Audit `games/<game>/assets/<tool>/data/*`.
Recommendation target:
- avoid generic `data/` folders when they only hold tool-owned data that should be directly manifest-addressed.
- do not move files in this PR unless the manifest wiring is clear and safe.

### E. Palette Normalization
Normalize palette swatch hex:
- `#RRGGBBFF` -> `#RRGGBB`
- preserve `#RRGGBBAA` only when `AA != FF`

### F. Deletion Candidate Audit
Audit and report before deletion:
- `tools/codex/sample_maaping_example.json`
- `tools/dev/checkPhase24*`
- `tools/dev/checkSharedExt*.json`
- `tools/samples/*`
- `tools/shared/samples/*`
- any other JSON in `tools/` not used by samples, games, tools, docs, or tests

Delete only if:
- not imported/referenced
- not used by any npm script
- not referenced by docs
- not part of current guard/test workflow

### G. Sample Dropdown Removal Plan
Do not implement broad UI changes in this PR. Create a follow-up plan:
- remove sample dropdown/selects from tools
- keep `/samples` as the only sample usecase
- migrate any tool-local samples to `/samples/phase-*`

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- Add/advance blocker item: manifest SSoT audit `[ ] -> [.]`
- Add/advance blocker item: unused JSON cleanup audit `[ ] -> [.]`
- Add/advance blocker item: palette opaque alpha normalization `[ ] -> [.]`

## Acceptance
- User blockers are recorded in a report.
- Manifest SSoT audit report exists.
- Deletion candidate report exists.
- Palette alpha normalization is applied or reported if no changes needed.
- No runtime rewrite.
- No validators.
- No `start_of_day` changes.
