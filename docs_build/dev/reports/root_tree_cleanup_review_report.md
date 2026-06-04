# PR_26154_037 Root Tree Cleanup Review

## Clean Active Root Folders

These folders are active root ownership and should remain:

| Folder | Ownership |
| --- | --- |
| `account/` | Active account pages. |
| `admin/` | Active admin/control pages. |
| `assets/` | Active public assets, including Theme V2. |
| `community/` | Active community pages. |
| `company/` | Active company pages. |
| `docs/` | User-facing documentation. |
| `docs_build/` | Build, development, governance, PR, workflow, report, schema, and reference documentation. |
| `games/` | Active public game discovery and game-type pages. |
| `learn/` | Active learning destination. |
| `legal/` | Active legal pages. |
| `marketplace/` | Active marketplace destination. |
| `scripts/` | Active or ambiguous automation. |
| `src/` | Active shared engine/runtime/source implementation. |
| `tests/` | Active and ambiguous validation inventory. |
| `toolbox/` | Active toolbox pages, template source, shared contracts, and active toolbox support. |

## Intentional Non-Product Root Folders

| Folder | Classification | Notes |
| --- | --- | --- |
| `.codex/` | Development tooling | Codex skill/config support. |
| `.github/` | Development tooling | GitHub workflow/config support. |
| `.githooks/` | Development tooling | Git hook support. |
| `.vscode/` | Development tooling | Local/editor configuration. |
| `node_modules/` | Local dependency install | Not source ownership. |
| `tmp/` | Build/package output | Left untouched by archive relocation except for required BUILD delta packaging. |

## Archive Ownership

| Folder | Classification | Notes |
| --- | --- | --- |
| `archive/` | Intentional legacy archive | Contains deprecated V1/V2 reference material under `archive/v1-v2/`. |
| `archive/v1-v2/tools/` | Deprecated reference tools | Former `old-tools/`. |
| `archive/v1-v2/games/` | Deprecated reference games | Former `old_games/`. |
| `archive/v1-v2/samples/` | Deprecated reference samples | Former `old_samples/`. |

## Legacy Or Ambiguous Follow-Up Candidates

No root folders named `old-tools/`, `old_games/`, or `old_samples/` remain.

Remaining old-path references outside `docs_build/` and outside `archive/v1-v2/`:

| Area | Files | Matches | Classification |
| --- | ---: | ---: | --- |
| `README.md` | 1 | 2 | Stale docs link candidate. |
| `scripts/` | 5 | 28 | Ambiguous archive-aware validation/tooling follow-up. |
| `src/` | 4 | 7 | Engine/shared path behavior; do not change without an engine/runtime PR. |
| `tests/` | 14 | 98 | Deprecated/ambiguous validation fixtures; do not run against archive in this PR. |
| `toolbox/` | 18 | 277 | Legacy bridge/registry/sample support; do not redirect active app navigation in this PR. |

Recommended follow-up:

- Decide whether active tooling should recognize archived paths or whether all archive material should become documentation-only.
- Split active toolbox registry behavior from archived legacy registry references before changing `toolbox/toolRegistry.js`.
- Update or retire tests that still encode root `old_games/` and `old_samples/` paths.
- Review `src/engine/runtime/gameImageConvention.js` and related helpers in a dedicated engine/runtime path PR if archived games must remain directly playable.
