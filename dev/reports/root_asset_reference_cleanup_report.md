# Root Asset Reference Cleanup

Task: `PR_26154_012-root-asset-reference-cleanup`

## Summary

- Audited active public/root pages, active tools, games, public docs, assets, scripts, and source helpers for stale asset/root paths.
- Fixed one stale runtime-theme documentation reference in `src/engine/theme/README.md`.
- Did not modify `archive/v1-v2/games/` or `archive/v1-v2/samples/`.
- Did not rewrite historical `docs_build/dev/reports/**` content.

## Fixed References

Updated:

- `src/engine/theme/README.md`

Change:

- Removed the stale `/src/engine/theme/index.js` import example.
- Replaced it with `/src/engine/theme/toolboxaid-header.js`, which exists and exports the documented runtime helper.

## Active Surface Audit

Scanned active surfaces for:

- `GameFoundryStudio/`
- `src/engine/theme/`
- `assets/theme/v2/assets/`
- `assets/theme/v2/images/games/`
- `favicon.ico`

Included active roots:

- `index.html`
- `_page_template_v2.html`
- `account/`
- `admin/`
- `community/`
- `company/`
- `docs/`
- `games/`
- `learn/`
- `legal/`
- `marketplace/`
- `toolbox/`
- `assets/`
- `scripts/`
- `src/`
- selected active tests/guards for reference classification

Excluded:

- `start_of_day/`
- `archive/v1-v2/games/`
- `archive/v1-v2/samples/`
- `archive/v1-v2/tools/`
- `node_modules/`
- `tmp/`
- `tests/results/`

## Results

No active public/root page, active tool page, game page, or public doc references remain to:

- `GameFoundryStudio/`
- `assets/theme/v2/assets/`
- `assets/theme/v2/images/games/`
- `favicon.ico`

Remaining `src/engine/theme/` references are intentional runtime/guard/test references, not stale public asset references:

- `toolbox/shared/tooling/CapturePreviewRuntime.js` imports runtime theme helpers.
- `toolbox/dev/checkStyleSystemGuard.mjs` references runtime theme CSS as its guard baseline.
- `toolbox/dev/checkSharedExtractionGuard.baseline.json` records a runtime helper baseline.
- `tests/theme.test.js` imports runtime theme helpers.
- Workspace/tool smoke tests assert legacy/runtime shell references where those fixtures are still expected.
- `assets/theme/v1/README.md` documents that Theme V1 Font Awesome is consumed by `src/engine/theme/main.css`.
- `src/engine/theme/README.md` documents runtime ownership.

Remaining generated or historical references not fixed:

- `tests/validation/samples.shared.boundaries.report.json` still contains `/src/engine/theme/index.js`.

Reason:

- It is a generated validation report artifact, not an active public/root page, active tool, game, or public doc reference.
- Updating generated evidence by hand would be outside this cleanup PR.

Historical docs under `docs_build/**` still contain older `GameFoundryStudio/`, favicon, and Theme V2 migration references.

Reason:

- They are historical PR/audit records.
- The active runtime/page/tool/doc surfaces no longer depend on those paths.

## Validation Notes

- PASS: zero active references to `GameFoundryStudio/` in public/root pages, active tool pages, game pages, public docs, assets, scripts, and source helpers.
- PASS: zero active references to `assets/theme/v2/assets/`.
- PASS: zero active references to `assets/theme/v2/images/games/`.
- PASS: zero active references to `favicon.ico`.
- PASS: the only fixed stale `src/engine/theme/index.js` source-doc reference now points to the existing runtime helper.
