# PR_26154_016 Active vs Deprecated Inventory Report

Task: `PR_26154_016-final-theme-engine-removal-and-active-structure-cleanup`

## Active Ownership

| Area | Ownership | Verification |
| --- | --- | --- |
| `assets/` | Public/static assets, including Theme V2 CSS, JS, partials, fonts, and images. | `assets/theme/v1/` removed; active header image now lives at `assets/theme/v2/images/toolboxaid-header.png`. |
| `tools/` | Active tool surfaces and active tool support code. | Active tool folders use `tools/[toolname]/index.html`; support folders and support files remain under `tools/`. |
| `games/` | Active game category surfaces and active game assets. | Game category folders with `index.html`: `action`, `adventure`, `arcade`, `puzzle`, `racing`, `retro`, `strategy`. `games/assets/` is support content. |
| `docs/` | User-facing documentation only. | Contains `index.html`, `faq.html`, `reference.html`, `support.html`, and `README.md`. |
| `docs_build/` | Governance, PR, reports, schemas docs, workflow, and build/development documentation. | Contains build/governance folders such as `dev/`, `pr/`, `reports/`, `schemas/`, `tools/`, and related workflow areas. |
| `src/` | Active engine/source code excluding removed theme shell. | `src/engine/theme/` removed after active dependencies were removed. |

## Active Tools

Active tool folders with `index.html`:

- `tools/ai-assistant/index.html`
- `tools/animation/index.html`
- `tools/assets/index.html`
- `tools/builder/index.html`
- `tools/cloud/index.html`
- `tools/code/index.html`
- `tools/configuration-admin/index.html`
- `tools/creator/index.html`
- `tools/game-builder/index.html`
- `tools/game-design/index.html`
- `tools/input/index.html`
- `tools/localization/index.html`
- `tools/midi/index.html`
- `tools/object-vector/index.html`
- `tools/palette/index.html`
- `tools/particles/index.html`
- `tools/publish/index.html`
- `tools/sound/index.html`
- `tools/storage/index.html`
- `tools/world-vector/index.html`

Active tool support areas/files:

- `tools/dev/`
- `tools/schemas/`
- `tools/shared/`
- `tools/index.html`
- `tools/renderToolsIndex.js`
- `tools/toolRegistry.js`
- `tools/tools-page-accordions.js`

## Deprecated Ownership

| Area | Ownership | Verification |
| --- | --- | --- |
| `old-tools/` | Deprecated tool references. | Contains deprecated `old_*` tools plus deprecated/common support folders. |
| `old_games/` | Deprecated playable games. | Contains legacy playable game folders and support/metadata files. |
| `old_samples/` | Deprecated samples. | Contains legacy phase sample folders and support/metadata files. |

## Remaining Cleanup Candidates

These were identified but not moved in this PR:

- `tools/_templates-v2/` still exists under `tools/` with an `index.html`; confirm whether it is an active template surface or should join deprecated template content under `old-tools/`.
- `tools/dev/`, `tools/schemas/`, and `tools/shared/` are support folders under `tools/`, not user-facing tool surfaces. Future structure cleanup could document this exception or move support code if a new owner is approved.
- `tools/renderToolsIndex.js` and `tools/toolRegistry.js` remain root-level tool support files; future cleanup could consolidate them only if active imports are mapped first.
- `games/assets/` is a support folder under `games/`, not a game category page.
- `docs_build/account/`, `docs_build/archive/`, `docs_build/operations/`, and related docs_build folders are build/governance documentation; keep out of public `/docs/`.

## Validation

- PASS: Active stale-reference validation for `GameFoundryStudio/`, `src/engine/theme/`, `assets/theme/v1/`, and `favicon.ico`.
- PASS: Active structure inventory completed for `tools/`, `old-tools/`, `games/`, `old_games/`, `old_samples/`, `docs/`, and `docs_build/`.
- PASS: Deprecated areas were not modified.
