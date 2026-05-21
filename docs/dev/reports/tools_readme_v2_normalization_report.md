# PR_26140_083 Tools README V2 Normalization Report

## Summary
- Split `docs/tools/README.md` from one mixed `Primary Tool UAT Docs` section into:
  - `Primary Tool UAT Docs - Legacy`
  - `Primary Tool UAT Docs - V2`
- Added Asset Manager V2 to the V2 UAT list.
- Added Palette Manager V2 to the V2 UAT list.
- Kept Object Vector Studio V2 and World Vector Studio V2 in the V2 section after PR_26140_082.
- Added missing standardized UAT docs for Asset Manager V2 and Palette Manager V2 so the README links resolve.

## Scope
- Documentation only.
- No schema changes.
- No sample JSON changes.
- No runtime behavior changes.

## Playwright Impact
- Playwright impacted: No.
- No Playwright impact. This PR is docs/workflow only.

## Validation
- Ran markdown/link sanity validation for `docs/tools/README.md`.
- Confirmed `Asset Manager V2` appears in `docs/tools/README.md`.
- Confirmed `Palette Manager V2` appears in `docs/tools/README.md`.
- Confirmed `Primary Tool UAT Docs - Legacy` appears in `docs/tools/README.md`.
- Confirmed `Primary Tool UAT Docs - V2` appears in `docs/tools/README.md`.
- Confirmed every local markdown link in `docs/tools/README.md` resolves.
- Ran whitespace sanity validation for the changed docs files with `git diff --check`.
- Confirmed no schema files or sample JSON files were changed by this PR.

## Manual Validation
- Open `docs/tools/README.md`.
- Confirm legacy tools are listed under `Primary Tool UAT Docs - Legacy`.
- Confirm V2 tools are listed under `Primary Tool UAT Docs - V2`.
- Confirm Asset Manager V2 and Palette Manager V2 links open their UAT docs.

## Full Samples Smoke Test
- Not run. This PR is docs-only and does not affect sample runtime behavior.
