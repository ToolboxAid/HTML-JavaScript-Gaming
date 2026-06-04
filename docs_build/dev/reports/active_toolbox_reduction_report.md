# Active Toolbox Reduction Report

Task: `PR_26154_045-active-toolbox-reduction`

## Summary

Reduced the active Toolbox surface to real end-user tools by archiving two clear non-user-facing pages:

- `toolbox/configuration-admin/index.html` -> `archive/v1-v2/tools/toolbox-reduction-reference/configuration-admin/index.html`
- `toolbox/creator/index.html` -> `archive/v1-v2/tools/toolbox-reduction-reference/tool-creator/index.html`

The active Toolbox now contains 16 tool pages plus the active template source `toolbox/_tool_template-v2/`.

## Requested Folder Classification

| Folder | Classification | Action |
| --- | --- | --- |
| `toolbox/dev` | DOCS_BUILD | Already absent from active Toolbox; ownership remains under docs/build governance from prior cleanup. |
| `toolbox/shared` | ENGINE/SRC | Already absent from active Toolbox; active shared behavior remains under `src/shared/toolbox/`. |
| `toolbox/schemas` | ENGINE/SRC | Already absent from active Toolbox; active schemas remain under `src/shared/schemas/`. |
| `toolbox/assets` | ACTIVE TOOL | Kept as an end-user asset creation surface. |
| `toolbox/code` | ACTIVE TOOL / AMBIGUOUS | Kept because active contracts and shared creator-extension behavior still reference this surface. |
| `toolbox/creator` | ARCHIVE | Moved to archive as template/tool-authoring reference material, not an end-user tool. |
| `toolbox/configuration-admin` | ARCHIVE | Moved to archive as admin/settings reference material, not an end-user Toolbox tool. |

## Active Reference Updates

- Removed Configuration Admin and Tool Creator from `assets/theme-v2/partials/header-nav.html`.
- Removed Configuration Admin and Tool Creator route aliases from `assets/theme-v2/js/gamefoundry-partials.js`.
- Removed the `Tooling` group from `toolbox/tools-page-accordions.js`.
- Extended `scripts/validate-active-tools-surface.mjs` so retired `toolbox/configuration-admin` and `toolbox/creator` routes fail active-surface validation if reintroduced.

## Validation

- PASS: `node scripts/validate-active-tools-surface.mjs`
- PASS: targeted scans found no active references to the retired `toolbox/configuration-admin` or `toolbox/creator` routes.
- PASS: active Toolbox template audit reports 16 active pages, 10 markers, 0 mismatches.
- PASS: `npm run test:workspace-v2`

## Notes

- Marketplace remains outside Toolbox and is not listed in `toolbox/index.html`.
- `toolbox/code` remains active for now because it is tied to active creator-extension contracts; moving it would require a dedicated registry/runtime reconciliation PR.
