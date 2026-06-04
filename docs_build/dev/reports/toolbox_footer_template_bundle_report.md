# PR_26154_022 Toolbox Footer Template Consistency Bundle Report

## Scope

Task: `PR_26154_022-toolbox-footer-template-consistency-bundle`.

Primary changes:
- Renamed the active public tool surface from `tools/` to `toolbox/`.
- Renamed the active tool template source from `tools/_templates-v2/` to `toolbox/_tool_template-v2/`.
- Updated active route, navigation, script, test, schema-reference, and docs_build references required by the rename.
- Aligned the shared footer IA to the requested exact menu groups.
- Completed a template consistency audit for active public/root pages and active toolbox pages.

## PR_26154_021 Review

Status: intact.

Confirmed:
- Deprecated-only scripts/tests removed in PR_26154_021 were not restored.
- Removed Arcade tooling entries were not restored in `toolbox/index.html` or `toolbox/tools-page-accordions.js`.
- `package.json` remains at repository root.
- `archive/v1-v2/tools/`, `archive/v1-v2/games/`, and `archive/v1-v2/samples/` were not used as active validation targets.

## Template Rename

Completed:
- `tools/_templates-v2/` renamed to `toolbox/_tool_template-v2/` as part of the active surface rename.
- References to the previous `tools/_templates-v2` and `_templates-v2` path were updated to `toolbox/_tool_template-v2`.
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` now names `toolbox/_tool_template-v2` as the required first-class tool template source.

Validation:
- PASS: `toolbox/_tool_template-v2/index.html` exists.
- PASS: `toolbox/_templates-v2/` does not exist.
- PASS: no active reference remains to `tools/_templates-v2` or `_templates-v2`.

## Toolbox Rename

Completed:
- `tools/` renamed to `toolbox/`.
- Active header, footer, home, toolbox index, script, schema, test, and Workspace/tool launch references were updated from the removed public `tools/` path to `toolbox/`.
- `assets/theme/v2/js/gamefoundry-partials.js` now uses the `toolbox` route key and root segment for shared nav highlighting.
- `scripts/validate-active-tools-surface.mjs`, `scripts/validate-tool-registry.mjs`, `toolbox/dev/checkSharedExtractionGuard.mjs`, and active route tests now point at `toolbox/`.
- `archive/v1-v2/tools/` was not renamed or moved.

Notes:
- Remaining `tools` path segments that are not stale active-root references are category namespaces such as `tests/tools/`, `tests/playwright/tools/`, `toolbox/schemas/tools/`, `assets/theme/v2/images/tools/`, `assets/theme/v2/css/tools/`, `src/shared/contracts/tools/`, and `src/tools/common/`.
- `assets/theme/v2/css/styles.css` imports were corrected back to `tools/grouping/...` because that is an existing CSS asset namespace, not the removed public tool root.

## Footer IA

Shared source: `assets/theme/v2/partials/footer.html`.

Final footer IA:
- Product: Toolbox, Games, Marketplace, Learn
- Community: Community
- Docs & Help: Docs, FAQ, Support, Reference
- Account: Account Home, Profile, Preferences, Security
- Legal: Privacy Policy, Terms & Legal, Cookie Policy, Disclaimer
- Company: About, Vision, Mission, Roadmap, Release Notes, Contact

Validation:
- PASS: footer source matches the requested IA exactly.

## Template Consistency Audit

Report: `docs_build/dev/reports/template_consistency_audit_report.md`.

Applied small obvious fix:
- `marketplace/index.html` now loads `../assets/theme/v2/css/theme.css` after the existing aggregate stylesheet. This fixes shared Theme V2 nav/footer behavior while preserving existing page helper classes.

Remaining mismatches:
- Public/root pages still have a broader `styles.css` aggregate versus `theme.css` split.
- Some toolbox pages still do not fully match the tool template shell markers.
- These were reported instead of mass-fixed to avoid broad layout/template rewrites in this PR.

## Marketplace Menu Check

A focused Playwright browser check loaded `/marketplace/index.html` and verified:
- Toolbox menu becomes visible.
- Two nested toolbox groups are present.
- Objects submenu becomes visible on hover.
- Worlds submenu becomes visible on hover.
- No failed network requests were observed.

## Validation

PASS:
- Structural validation for PR_26154_021 cleanup, toolbox/template renames, exact footer IA, and tools index alphabetical order.
- Active HTML/CSS path validation: 66 HTML files and 515 references checked.
- Targeted static syntax validation: 34 JS/MJS files checked with `node --check`; 4 JSON files parsed.
- `git diff --check`.
- `npm run test:workspace-v2`.
- Focused Playwright marketplace nested-menu visibility check.

Skipped per request:
- No tests against `archive/v1-v2/tools/`, `archive/v1-v2/games/`, or `archive/v1-v2/samples/`.
- No full samples smoke test.
