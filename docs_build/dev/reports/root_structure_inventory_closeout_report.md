# Root Structure Inventory Closeout

Task: `PR_26154_013-root-structure-inventory-closeout`

## Summary

Created a current root ownership inventory without moving files.

No `start_of_day/` folders were modified.

## Current Ownership

| Path | Status | Current Ownership |
| --- | --- | --- |
| `assets/` | active | Public/root static asset ownership. Contains `assets/theme/v1/` legacy static assets and `assets/theme/v2/` public Theme V2 CSS, JS, partials, and imagery. |
| `tools/` | active | Active public tool pages plus active tool support surfaces, including `tools/shared/`, `tools/dev/`, and `tools/schemas/`. |
| `old-tools/` | deprecated | Deprecated legacy tool references. Kept for reference/playable legacy behavior where applicable; not an active future-state tool surface. |
| `games/` | active | Current public games surface, game-type pages, arcade entry, and `games/assets/images/`. |
| `old_games/` | deprecated | Deprecated playable reference games. Kept playable, but excluded from active validation. |
| `old_samples/` | deprecated | Deprecated reference samples. Excluded from active validation. |
| `docs/` | active public docs | User-facing documentation only: `index.html`, `faq.html`, `reference.html`, `support.html`, and `README.md`. |
| `docs_build/` | development docs | Development, build, PR, governance, workflow, audit, report, release, security, and archived documentation. |
| `schemas/` | absent | No root `schemas/` folder currently exists. Active schema ownership is under `tools/schemas/`; historical schema docs live under `docs_build/schemas/`. |
| `src/` | active source | Engine, shared, advanced, assets, and tool source/runtime code. `src/engine/theme/` remains runtime-owned per project instructions. |

## Root Folder Counts

| Path | Files | Directories |
| --- | ---: | ---: |
| `assets/` | 150 | 19 |
| `tools/` | 201 | 48 |
| `old-tools/` | 356 | 123 |
| `games/` | 12 | 9 |
| `old_games/` | 311 | 132 |
| `old_samples/` | 1580 | 858 |
| `docs/` | 5 | 0 |
| `docs_build/` | 4478 | 316 |
| `schemas/` | missing | missing |
| `src/` | 464 | 103 |

## Observations

- Root `favicon.svg` is the canonical browser favicon.
- Public Theme V2 assets are under `assets/theme/v2/`.
- Legacy static Theme V1 assets are under `assets/theme/v1/`.
- Runtime engine shell styling remains under `src/engine/theme/`.
- Current games imagery lives under `games/assets/images/`.
- Active schema files live under `tools/schemas/`, not root `schemas/`.

## Remaining Cleanup Candidates

No files were moved for these candidates in this PR.

- Review whether `tools/_templates-v2/` is still an active template surface or should be deprecated after a future template replacement.
- Review whether `old-tools/codex/` and `old-tools/common/` are still needed as deprecated references.
- Regenerate or retire stale generated validation artifacts that reference removed paths, such as `tests/validation/samples.shared.boundaries.report.json`.
- Decide whether root-level branding assets should move out of `assets/theme/v2/images/` in a future root-branding PR.
- Decide whether root `schemas/` should remain absent permanently or receive an explicit redirect/documentation marker pointing to `tools/schemas/`.
- Continue reducing historical path noise in `docs_build/` only if a future archival cleanup PR explicitly targets historical docs.

## Validation Notes

- PASS: required ownership paths were inventoried.
- PASS: `schemas/` absence was confirmed.
- PASS: no root structure moves were performed in this closeout PR.
- PASS: `start_of_day/`, `old_games/`, and `old_samples/` were not modified.
