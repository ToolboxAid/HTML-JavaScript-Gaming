# PR_26180_OWNER_017 src Dissection and Demo Cleanup Report

## Executive Summary

PR_26180_OWNER_017 removes the local ignored demo artifact `assets/DemoGame-26168-001.gfsp`, removes the now-empty `assets/` shell, and audits every tracked file under `src/`.

No tracked `src/` files are moved in this PR. The file-by-file audit assigns proposed destinations, but most files require scoped reference migrations to preserve runtime behavior.

## Demo Artifact Cleanup

- Deleted local ignored artifact: `assets/DemoGame-26168-001.gfsp`.
- Removed `assets/` after the artifact deletion left the folder empty.
- No tracked files were deleted.
- No active `assets/DemoGame-26168-001.gfsp` path references remain outside reports/workspace.

Filename-only `DemoGame-26168-001.gfsp` references remain in Playwright tests as generated-download assertions. Those are not references to the deleted root file path.

## src Audit Summary

Tracked `src/` files audited: 596.

The detailed file-by-file audit lives at:

`dev/reports/PR_26180_OWNER_017-src-dissection-and-demo-cleanup_src-file-destination-audit.md`

## src Move Decision

No `src/` files moved.

Reason:

- `src/` content is actively referenced by `www/`, `api/`, `dev/tests/`, and `dev/tools/`.
- Moving `src/` files requires scoped import/reference updates.
- The PR request requires preserving runtime behavior.
- Uncertain or mixed-ownership files must be documented before movement.

## Proposed Follow-Up PRs

1. Browser API client migration: move `src/api/` browser clients to a browser-owned location.
2. Engine runtime migration: move `src/engine/` to the final browser/runtime source layer.
3. Shared contract/schema migration: split `src/shared/contracts/` and `src/shared/schemas/` into the API contract surface.
4. Shared utility migration: split `src/shared/` browser/runtime utilities by actual import ownership.
5. Legacy Admin Notes retirement: migrate or retire `src/dev-runtime/admin/`.

## Runtime/Product Impact

No runtime behavior changed. No product code changed. No API/database behavior changed.
