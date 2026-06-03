# PR_26151_008-gamefoundry-controls-and-accordions Validation

## Scope

GameFoundryStudio-only controls and accordion cleanup.

## Changes Validated

- `GameFoundryStudio/assets/css/controls.css` now owns native HTML element sizing, spacing, typography, and control scale.
- `GameFoundryStudio/assets/css/gamefoundrystudio.css` was added as the GameFoundry custom pattern owner.
- `GameFoundryStudio/assets/css/styles.css` imports `gamefoundrystudio.css` after `controls.css`.
- `GameFoundryStudio/assets/css/tools.css` no longer owns tool custom pattern rules.
- Stacked tool page `details` accordions now use `vertical-accordion`.
- `GameFoundryStudio/assets/js/tool-display-mode.js` keeps Tool Display Mode behavior and adds horizontal side-column collapse/expand controls.
- Left side columns use `<` when open and `>` when collapsed.
- Right side columns use `>` when open and `<` when collapsed.
- Side column collapse toggles `is-left-collapsed` and `is-right-collapsed` on `.tool-workspace`, allowing the center workspace grid track to expand.
- Tool Display Mode remains before center content on tool pages.

## Commands

```text
Get-Content docs_build/dev/PROJECT_INSTRUCTIONS.md
Get-Content .codex/skills/repo-build/SKILL.md
Get-Content docs_build/dev/reports/PR_26151_006-gamefoundry-current-state-verification.md
Get-Content docs_build/dev/reports/PR_26151_007-gamefoundry-ssot-cleanup-validation.md
Get-Content GameFoundryStudio/assets/css/styles.css
Get-Content GameFoundryStudio/assets/css/base.css
Get-Content GameFoundryStudio/assets/css/controls.css
Get-Content GameFoundryStudio/assets/css/pages.css
Get-Content GameFoundryStudio/assets/css/tools.css
Get-Content GameFoundryStudio/assets/js/tool-display-mode.js
Get-Content GameFoundryStudio/assets/js/gamefoundry-partials.js
Get-Content GameFoundryStudio/tools/asset-studio.html
Get-Content GameFoundryStudio/tools/groups/configuration-admin.html
rg -n 'class="accordion"|details\.accordion|\.accordion ' GameFoundryStudio -g '*.html' -g '*.css' -g '*.js'
rg -n "#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|linear-gradient|radial-gradient|var\(--(orange|gold|cyan|purple|green|pink|meaning|text|muted|line|bg|panel|molten|forge|electric|arcade|steel|shadow)" GameFoundryStudio/assets/css/controls.css
rg -n "\.btn|\.field|\.form-row|\.tool-column|\.tool-center-panel|\.tool-display-mode|\.card|\.panel|\.pill|\.callout|\.status|\.log|\.sub-menu|\.nav|vertical-accordion|horizontal-accordion|accordion-body" GameFoundryStudio/assets/css/base.css GameFoundryStudio/assets/css/controls.css GameFoundryStudio/assets/css/pages.css GameFoundryStudio/assets/css/tools.css
rg --pcre2 -n "<style\b|<script(?![^>]*\bsrc=)|\son[a-zA-Z]+\s*=|\sstyle\s*=" GameFoundryStudio -g "*.html"
node --check GameFoundryStudio/assets/js/tool-display-mode.js
node --check GameFoundryStudio/assets/js/gamefoundry-partials.js
npm run test:playwright:static
git status --short
```

## Results

- PASS: `controls.css` color-token scan returned no matches.
- PASS: no old `class="accordion"`, `details.accordion`, or `.accordion ` pattern references remain in GameFoundryStudio HTML/CSS/JS.
- PASS: GameFoundry custom pattern ownership scan against `base.css`, `controls.css`, `pages.css`, and `tools.css` found only `card-grid` in `pages.css`; the listed custom patterns are owned by `gamefoundrystudio.css`.
- PASS: no inline `<style>` blocks, inline `<script>` blocks, inline event handlers, or inline `style=` attributes were found in GameFoundryStudio HTML.
- PASS: `node --check` passed for `tool-display-mode.js` and `gamefoundry-partials.js`.
- PASS: horizontal accordion static hooks exist in CSS and JS: `horizontal-accordion-toggle`, `is-left-collapsed`, and `is-right-collapsed`.
- PASS: `<` and `>` indicators are defined in `tool-display-mode.js`.
- PASS: `npm run test:playwright:static` passed.
- WARN: targeted Node structural validators and `git diff --check` intermittently hit the sandbox `spawn setup refresh` failure before executing. Earlier static `rg` and syntax checks completed.
- WARN: `npm run test:playwright:static` regenerated existing lane report files under `docs_build/dev/reports`; these are validation outputs from the repo command.

## Playwright Impact

Playwright impacted: Yes. This PR changes GameFoundryStudio tool UI interactions and CSS ownership.

Existing GameFoundryStudio-specific browser navigation/tool-page coverage was not found during the previous PRs. The available static Playwright lane passed. Browser interaction validation remains a manual check for the new horizontal accordion behavior.

## Lanes

- lanes executed: runtime/static for GameFoundryStudio CSS ownership, tool page accordion classes, external JS syntax, inline HTML restrictions, and static Playwright validation.
- lanes skipped: engine, samples, and broad integration because no engine/runtime, sample JSON, or Workspace V2 contract behavior changed.
- samples decision: SKIP because this PR is GameFoundryStudio UI/CSS/JS only and the user explicitly prohibited full samples smoke.
- blocker scope: browser interaction validation only; static checks and JS syntax checks passed.
- expected PASS behavior: side column headers expose `<` and `>` controls, left/right side columns collapse horizontally, center workspace uses the released width, vertical accordions continue to open and close, and Tool Display Mode remains above center content.
- expected WARN behavior: generated lane report churn from the static Playwright command and sandbox spawn failures that prevent selected follow-up commands from starting.

## Manual Validation

1. Open `GameFoundryStudio/tools/asset-studio.html`.
2. Confirm Tool Display Mode appears above the center workspace content.
3. Click the left `Toolbox` header toggle and confirm the left column collapses to the side and the center workspace widens.
4. Click the left toggle again and confirm the left column expands.
5. Click the right `Status` header toggle and confirm the right column collapses to the side and the center workspace widens.
6. Open and close the stacked `Launch` and `Workflow` vertical accordions.
7. Activate Tool Display Mode and confirm fullscreen/focus behavior still works with the horizontal accordions.
8. Repeat a quick check on `GameFoundryStudio/tools/game-builder.html` and `GameFoundryStudio/tools/storage-inspector.html`.

Expected outcome: left/right horizontal accordion controls use `<` and `>`, side columns collapse/expand without breaking Tool Display Mode, and vertical accordions retain native details/summary behavior.
