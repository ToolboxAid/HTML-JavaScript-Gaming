# PR_26154_016 Active vs Deprecated Inventory Report

Task: `PR_26154_016-final-theme-engine-removal-and-active-structure-cleanup`

## Active Ownership

| Area | Ownership | Verification |
| --- | --- | --- |
| `assets/` | Public/static assets, including Theme V2 CSS, JS, partials, fonts, and images. | `assets/theme/v1/` removed; active header image now lives at `assets/theme/v2/images/toolboxaid-header.png`. |
| `toolbox/` | Active tool surfaces and active tool support code. | Active tool folders use `toolbox/[toolname]/index.html`; support folders and support files remain under `toolbox/`. |
| `games/` | Active game category surfaces and active game assets. | Game category folders with `index.html`: `action`, `adventure`, `arcade`, `puzzle`, `racing`, `retro`, `strategy`. `games/assets/` is support content. |
| `docs/` | User-facing documentation only. | Contains `index.html`, `faq.html`, `reference.html`, `support.html`, and `README.md`. |
| `docs_build/` | Governance, PR, reports, schemas docs, workflow, and build/development documentation. | Contains build/governance folders such as `dev/`, `pr/`, `reports/`, `schemas/`, `toolbox/`, and related workflow areas. |
| `src/` | Active engine/source code excluding removed theme shell. | `src/engine/theme/` removed after active dependencies were removed. |

## Active Tools

Active tool folders with `index.html`:

- `toolbox/ai-assistant/index.html`
- `toolbox/animation/index.html`
- `toolbox/assets/index.html`
- `toolbox/builder/index.html`
- `toolbox/cloud/index.html`
- `toolbox/code/index.html`
- `toolbox/configuration-admin/index.html`
- `toolbox/creator/index.html`
- `toolbox/game-builder/index.html`
- `toolbox/game-design/index.html`
- `toolbox/input/index.html`
- `toolbox/localization/index.html`
- `toolbox/midi/index.html`
- `toolbox/object-vector/index.html`
- `toolbox/palette/index.html`
- `toolbox/particles/index.html`
- `toolbox/publish/index.html`
- `toolbox/sound/index.html`
- `toolbox/storage/index.html`
- `toolbox/world-vector/index.html`

Active tool support areas/files:

- `toolbox/dev/`
- `toolbox/schemas/`
- `toolbox/shared/`
- `toolbox/index.html`
- `toolbox/renderToolsIndex.js`
- `toolbox/toolRegistry.js`
- `toolbox/tools-page-accordions.js`

## Deprecated Ownership

| Area | Ownership | Verification |
| --- | --- | --- |
| `archive/v1-v2/tools/` | Deprecated tool references. | Contains deprecated `old_*` tools plus deprecated/common support folders. |
| `archive/v1-v2/games/` | Deprecated playable games. | Contains legacy playable game folders and support/metadata files. |
| `archive/v1-v2/samples/` | Deprecated samples. | Contains legacy phase sample folders and support/metadata files. |

## Remaining Cleanup Candidates

These were identified but not moved in this PR:

- `toolbox/_tool_template-v2/` still exists under `toolbox/` with an `index.html`; confirm whether it is an active template surface or should join deprecated template content under `archive/v1-v2/tools/`.
- `toolbox/dev/`, `toolbox/schemas/`, and `toolbox/shared/` are support folders under `toolbox/`, not user-facing tool surfaces. Future structure cleanup could document this exception or move support code if a new owner is approved.
- `toolbox/renderToolsIndex.js` and `toolbox/toolRegistry.js` remain root-level tool support files; future cleanup could consolidate them only if active imports are mapped first.
- `games/assets/` is a support folder under `games/`, not a game category page.
- `docs_build/account/`, `archive/v1-v2/docs_build/archive/`, `docs_build/operations/`, and related docs_build folders are build/governance documentation; keep out of public `/docs/`.

## Validation

- PASS: Active stale-reference validation for `GameFoundryStudio/`, `src/engine/theme/`, `assets/theme/v1/`, and `favicon.ico`.
- PASS: Active structure inventory completed for `toolbox/`, `archive/v1-v2/tools/`, `games/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/`, `docs/`, and `docs_build/`.
- PASS: Deprecated areas were not modified.
