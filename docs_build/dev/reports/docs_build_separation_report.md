# Docs Build Separation Teardown Report

Task: PR_26154_002-docs-build-separation-teardown

## Summary

- Moved build/development documentation out of `/docs/` and into `/docs_build/`.
- Kept `/docs/` as the public/user-facing documentation surface.
- Removed the legacy `GameFoundryStudio/` folder after confirming active Theme V2 references no longer require it.
- Updated active references from `docs/dev/` to `docs_build/dev/` and from `docs/pr/` to `docs_build/pr/`.
- Updated active Theme V2 governance references to `assets/theme/v2`.

## Moved Folders

| Source | Destination | Notes |
| --- | --- | --- |
| `docs/dev/` | `docs_build/dev/` | Includes reports, governance, workflow docs, and `start_of_day`; `start_of_day` contents were not edited. |
| `docs/pr/` | `docs_build/pr/` | PR history and build specs. |
| `docs/archive/` | `docs_build/archive/` | Historical build/archive documentation. |
| `docs/operations/` | `docs_build/operations/` | Operations/workflow documentation. |
| `docs/reports/` | `docs_build/reports/` | Build/report documentation. |
| `docs/account/` | `docs_build/account/` | Internal design-system account docs. |
| `docs/security/` | `docs_build/security/` | Governance/security policy docs. |

## Public Docs Remaining

The remaining `/docs/` surface is limited to public docs and user-facing documentation groups:

- `docs/README.md`
- `docs/index.html`
- `docs/faq.html`
- `docs/reference.html`
- `docs/support.html`
- `docs/design/`
- `docs/reference/`
- `docs/release/`
- `docs/tools/`

## Legacy Folder Teardown

- Removed `GameFoundryStudio/`.
- Active asset and Theme V2 documentation now points to `assets/theme/v2`.
- Remaining `GameFoundryStudio/` literals are historical report references, protected `start_of_day` references, or guard assertions that intentionally check the old path is not used.

## Path Adjustments

- `docs/dev/PROJECT_INSTRUCTIONS.md` references now point to `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- `docs/dev/reports/` references now point to `docs_build/dev/reports/`.
- `docs/pr/` references now point to `docs_build/pr/`.
- Moved build-doc bucket references were updated for `docs_build/archive/`, `docs_build/operations/`, `docs_build/reports/`, `docs_build/account/`, and `docs_build/security/`.
- `tools/old_localization-studio/index.html` now uses `<base href="/">` and root-relative Theme V2 asset references.

## Validation

- PASS: `docs/dev/` and `docs/pr/` references are absent outside protected `docs_build/dev/start_of_day`.
- PASS: `GameFoundryStudio/` references are limited to historical reports, protected docs, or guard assertions.
- PASS: `GameFoundryStudio/`, `docs/dev/`, and `docs/pr/` folders are absent.
- PASS: required `docs_build/dev/PROJECT_INSTRUCTIONS.md`, `docs_build/dev/reports/`, and `docs_build/pr/` paths exist.
- PASS: `node --check` for 18 changed active JS/MJS/CJS files.
- PASS: static HTML path validation for 4 changed active HTML files.
- PASS: `git diff --check`.
- SKIPPED: `npm run test:workspace-v2`; Workspace V2 launch/navigation behavior was not changed.
- SKIPPED: full samples smoke test per request.

## Notes

- `docs_build/dev/start_of_day/**` still contains old path mentions by design because the folder was protected from content edits.
- Historical reports under `docs_build/dev/reports/**` and `docs_build/archive/**` still contain old `GameFoundryStudio/` references as historical record.
