# PR_26154_034 Toolbox Inventory Convergence

Baseline used: `PR_26154_031-033-template-test-root-polish`.

## Scope

- Inventoried every active `toolbox/[toolname]/index.html` page.
- Confirmed each active tool is header-wired, present in the toolbox index grouping, and carries the shared toolbox template contract markers.
- Fixed only clear convergence gaps.

## Fixes Applied

| File | Change | Reason |
| --- | --- | --- |
| `toolbox/tools-page-accordions.js` | Added a `Tooling` group with Configuration Admin, Tool Builder, and Tool Creator. | These three active toolbox pages were already header-wired and template-aligned but were missing from the toolbox index grouping. |

No toolbox page layout or local CSS/JS was changed.

## Active Toolbox Inventory

| Tool Page | Header Nav | Toolbox Index | Template Markers |
| --- | --- | --- | --- |
| `toolbox/ai-assistant/index.html` | PASS | PASS: AI | PASS |
| `toolbox/animation/index.html` | PASS | PASS: Objects | PASS |
| `toolbox/assets/index.html` | PASS | PASS: Objects | PASS |
| `toolbox/builder/index.html` | PASS | PASS: Tooling | PASS |
| `toolbox/cloud/index.html` | PASS | PASS: Assets | PASS |
| `toolbox/code/index.html` | PASS | PASS: Objects | PASS |
| `toolbox/configuration-admin/index.html` | PASS | PASS: Tooling | PASS |
| `toolbox/creator/index.html` | PASS | PASS: Tooling | PASS |
| `toolbox/game-builder/index.html` | PASS | PASS: Worlds | PASS |
| `toolbox/game-design/index.html` | PASS | PASS: Worlds | PASS |
| `toolbox/input/index.html` | PASS | PASS: Input | PASS |
| `toolbox/localization/index.html` | PASS | PASS: Assets | PASS |
| `toolbox/midi/index.html` | PASS | PASS: Audio | PASS |
| `toolbox/object-vector/index.html` | PASS | PASS: Objects | PASS |
| `toolbox/palette/index.html` | PASS | PASS: Colors | PASS |
| `toolbox/particles/index.html` | PASS | PASS: Worlds | PASS |
| `toolbox/publish/index.html` | PASS | PASS: Assets | PASS |
| `toolbox/sound/index.html` | PASS | PASS: Audio | PASS |
| `toolbox/storage/index.html` | PASS | PASS: Assets | PASS |
| `toolbox/world-vector/index.html` | PASS | PASS: Worlds | PASS |

Template marker criteria:

- `assets/theme-v2/css/theme.css`
- `data-tool-display-mode`
- `data-tool-slug`
- `assets/theme-v2/js/tool-display-mode.js`
- `tool-workspace`
- at least two `tool-column` markers
- `tool-center-panel`

## Before / After Counts

| Check | Before | After |
| --- | ---: | ---: |
| Active toolbox pages | 20 | 20 |
| Header-wired active tools | 20/20 | 20/20 |
| Toolbox-indexed active tools | 17/20 | 20/20 |
| Active tools missing template markers | 0 | 0 |

## Group Ordering

- PASS group order is alphabetical: AI, Assets, Audio, Colors, Input, Objects, Tooling, Worlds.
- PASS tools inside every group are alphabetized by visible tool title.

## Tools That Should Move To archive/v1-v2/tools

- No active `toolbox/[toolname]/index.html` pages should move to `archive/v1-v2/tools`.
- Deprecated non-page preview-generator support was handled under `PR_26154_036` and moved from `toolbox/shared/preview/` to `archive/v1-v2/tools/shared-preview/`.
