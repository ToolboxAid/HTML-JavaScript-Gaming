# Codex Commands

Task:

- `PR_26154_022-toolbox-footer-template-consistency-bundle`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- Targeted inspection of:
  - `_page_template_v2.html`
  - `toolbox/_tool_template-v2/index.html`
  - `assets/theme/v2/partials/header-nav.html`
  - `assets/theme/v2/partials/footer.html`
  - `assets/theme/v2/js/gamefoundry-partials.js`
  - `toolbox/index.html`
  - `toolbox/tools-page-accordions.js`
  - active route tests and validators
- Renamed `tools/` to `toolbox/`.
- Renamed `toolbox/_templates-v2/` to `toolbox/_tool_template-v2/`.
- Updated active references from `tools/` to `toolbox/` across public routes, scripts, tests, docs_build references, and Workspace/tool launch paths.
- Updated `docs_build/dev/PROJECT_INSTRUCTIONS.md` to name `toolbox/_tool_template-v2` as the required first-class tool template source.
- Updated `assets/theme/v2/partials/footer.html` to the requested footer IA.
- Updated `assets/theme/v2/js/gamefoundry-partials.js` route/root-segment handling for `toolbox`.
- Added `theme.css` wiring to `marketplace/index.html` for shared Theme V2 nav/footer behavior.
- Corrected CSS asset imports in `assets/theme/v2/css/styles.css` back to `tools/grouping/...`.
- Created:
  - `docs_build/dev/reports/template_consistency_audit_report.md`
  - `docs_build/dev/reports/toolbox_footer_template_bundle_report.md`
- Ran structural validation for PR021 cleanup, footer IA, template rename, toolbox rename, and tools index ordering.
- Ran active HTML/CSS path validation.
- Ran targeted `node --check` and JSON parse validation.
- Ran `git diff --check`.
- Ran `npm run test:workspace-v2`.
- Ran a focused Playwright marketplace nested-menu visibility check.
- Ran `npm run codex:review-artifacts`.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_022-toolbox-footer-template-consistency-bundle_delta.zip`

Validation summary:

- PASS structural validation for PR021 cleanup, exact footer IA, active toolbox rename, active template rename, and toolbox index alphabetical ordering.
- PASS active HTML/CSS path validation: 66 HTML files and 515 references checked.
- PASS targeted static syntax validation: 34 JS/MJS files checked and 4 JSON files parsed.
- PASS focused marketplace menu browser check: Toolbox, Objects, and Worlds menus visible as expected with no failed requests.
- PASS `git diff --check`.
- PASS `npm run test:workspace-v2`.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples` per request.
- SKIPPED full samples smoke test per request.
