# PR_26151_007-gamefoundry-ssot-cleanup Validation

## Scope

GameFoundryStudio-only cleanup using the PR_26151_006 verification findings as the source for current gaps.

## Changes Validated

- Nested GameFoundryStudio folders are authoritative for tools, account pages, and tool groups.
- Legacy root duplicates are intentional HTML redirects.
- `GameFoundryStudio/assets/css/controls.css` exists as the non-color control sizing, typography, spacing, and shared layout SSoT.
- Meaning and schema colors remain in the existing color/layout CSS files.
- `GameFoundryStudio/assets/partials/tool-shell.html` exists.
- `GameFoundryStudio/assets/partials/tool-page-shell.html` is removed and no longer referenced.
- GameFoundryStudio tool pages include Tool Display Mode before the center panel.
- Shared header/nav/footer partial slots are preserved on active nested pages.
- Account submenu keeps Branding and Controls through the shared partial.
- Existing page content and imagery were preserved on active nested pages.

## Commands

```text
rg --pcre2 -n "<style\b|<script(?![^>]*\bsrc=)|\son[a-zA-Z]+\s*=|\sstyle\s*=" GameFoundryStudio -g "*.html"
rg -n "tool-page-shell|data-tool-page-shell" GameFoundryStudio
rg -n "toolDisplayMode|tool-display-mode.js" GameFoundryStudio/tools -g "*.html"
rg -n "#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|linear-gradient|radial-gradient|var\(--(orange|gold|cyan|purple|green|pink|meaning|text|muted|line|bg|panel|molten|forge|electric|arcade|steel)" GameFoundryStudio/assets/css/controls.css
node --check GameFoundryStudio/assets/js/gamefoundry-partials.js
node --check GameFoundryStudio/assets/js/tool-display-mode.js
git diff --check
npm run test:playwright:static
npx playwright install chromium
```

## Results

- PASS: no inline `<style>` blocks, inline `<script>` blocks, inline event handlers, or inline `style=` attributes found in GameFoundryStudio HTML.
- PASS: no references to `tool-page-shell.html` or `data-tool-page-shell` remain.
- PASS: `tool-shell.html` exists and `tool-page-shell.html` is absent.
- PASS: `controls.css` exists.
- PASS: `controls.css` color ownership scan found no semantic colors, hex colors, rgb/rgba colors, hsl/hsla colors, or gradients.
- PASS: internal `href` navigation targets resolve.
- PASS: every direct `GameFoundryStudio/tools/*.html` tool page except `tools/index.html` has `#toolDisplayMode` before `.tool-center-panel`.
- PASS: legacy root duplicate pages are explicit redirects to canonical nested destinations.
- PASS: `node --check` passed for the shared partial loader and display-mode script.
- PASS: CSS brace/static check passed for changed CSS files.
- PASS: `git diff --check` completed with line-ending warnings only.
- PASS: `npm run test:playwright:static` completed successfully.
- WARN: focused browser page-load/navigation validation could not run because Playwright Chromium was not installed locally.
- WARN: `npx playwright install chromium` failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` while downloading from the Playwright CDN.

## Playwright Impact

Playwright impacted: Yes. This PR changes GameFoundryStudio page structure, navigation redirects, CSS control ownership, and tool display placement.

Existing GameFoundryStudio-specific Playwright navigation/page-load coverage was not found. A focused browser validation script was attempted, but the local Playwright browser was unavailable and browser installation was blocked by certificate verification.

## Lanes

- lanes executed: runtime/static for GameFoundryStudio pages, redirects, CSS ownership, and tool display placement.
- lanes skipped: engine, samples, and broad integration because no engine/runtime, sample JSON, or shared integration contract changed.
- samples decision: SKIP because the PR is GameFoundryStudio UI structure only and full samples smoke test was explicitly prohibited.
- blocker scope: Playwright browser execution only; static and navigation-resolution checks passed.
- expected PASS behavior: canonical nested GameFoundryStudio pages load through resolvable routes, root duplicates redirect, shared partials remain, controls.css owns non-color control layout, and tool pages expose Tool Display Mode above the center panel.
- expected WARN behavior: Playwright browser run remains blocked until the Chromium binary can be installed in the local environment.

## Manual Validation

1. Open `GameFoundryStudio/index.html`.
2. Use the shared nav to open Tools, Account, Branding, and Controls.
3. Open `GameFoundryStudio/tools/tool-builder.html` and `GameFoundryStudio/tools/ai-assistant.html`.
4. Confirm Tool Display Mode appears above the center workspace content.
5. Open legacy root pages such as `GameFoundryStudio/tool-builder.html`, `GameFoundryStudio/controls.html`, and `GameFoundryStudio/building-creation.html`.
6. Confirm each legacy page redirects to the nested canonical destination.

Expected outcome: nested destinations are authoritative, shared nav/footer remain visible on active pages, Tool Display Mode keeps fullscreen/display behavior, and legacy duplicates do not expose stale hardcoded navigation.
