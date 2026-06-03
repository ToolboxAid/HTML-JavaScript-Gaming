# Codex Commands

Task:

- `PR_26154_024-localization-template-rebuild`

Commands run:

- `Get-Content .codex/skills/repo-build/SKILL.md`
- `Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `git status --short`
- Inspected:
  - `toolbox/localization/index.html`
  - `toolbox/localization/css/localization-studio.css`
  - `toolbox/localization/js/localization-studio.js`
  - `toolbox/_tool_template-v2/index.html`
  - `toolbox/tools-page-accordions.js`
  - direct Localization launch expectation in `tests/playwright/tools/RootToolsFutureState.spec.mjs`
- Copied current `toolbox/localization/` to `old-tools/localization_pre_template_rebuild/`.
- Deleted active `toolbox/localization/`.
- Rebuilt active `toolbox/localization/` by copying `toolbox/_tool_template-v2/`.
- Updated only the rebuilt `toolbox/localization/index.html` Localization identity values.
- Ran targeted reference checks for:
  - `toolbox/localization/`
  - `old-tools/localization_pre_template_rebuild/`
  - `toolbox/_tool_template-v2/`
  - active local `css/` and `js/` folders
  - Localization links
- Ran static path and encoding validation for the rebuilt active HTML.
- Ran static path and encoding validation for the preserved old-tools backup HTML/CSS.
- Ran `node --check old-tools/localization_pre_template_rebuild/js/localization-studio.js`.
- Ran `git diff --check`.
- Ran `npm run codex:review-artifacts`.
- Packaged repo-structured ZIP:
  - `tmp/PR_26154_024-localization-template-rebuild_delta.zip`

Validation summary:

- PASS targeted Localization rebuild reference checks.
- PASS active `toolbox/localization/` contains only `index.html`.
- PASS old implementation preserved under `old-tools/localization_pre_template_rebuild/`.
- PASS no active local Localization CSS or JS folders remain.
- PASS static validation for changed HTML/CSS/JS surfaces in scope.
- PASS `git diff --check`.
- SKIPPED `npm run test:workspace-v2` because active toolbox registration and launch behavior were not changed.
- SKIPPED tests against `old-tools/`, `old_games/`, and `old_samples` per request.
- SKIPPED full samples smoke test per request.
