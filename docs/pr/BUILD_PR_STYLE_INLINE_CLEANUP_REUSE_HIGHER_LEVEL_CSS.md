# BUILD_PR_STYLE_INLINE_CLEANUP_REUSE_HIGHER_LEVEL_CSS

## Purpose
Remove the remaining inline `<style>` blocks and move the styles into shared CSS, preferring reuse of higher-level existing CSS whenever the rules already match or are close enough.

## Single PR Purpose
Eliminate the remaining inline style blocks without creating unnecessary new CSS files.

## Required Rule
If an inline `<style>` block matches or is close to rules already appropriate in a higher-level shared CSS path, reuse that CSS destination instead of creating a new file.

## Inline Style Targets
- `games/Breakout/index.html`
- `samples/phase-13/1316/index.html`
- `samples/phase-13/1316/server/networkSampleADashboardServer.mjs`
- `samples/phase-13/1317/index.html`
- `samples/phase-13/1318/index.html`
- `samples/phase-13/1319/index.html`
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`
- `samples/shared/runtimePreviewCapture.html`
- `tests/index.html`
- `tests/testRunner.html`
- `tools/preview/preview_svg_generator.html`
- `tools/shared/preview/generate-list-previews.html`
- `tools/shared/preview/generate-previews.html`

## Reuse-First CSS Destination Rules
1. Reuse an existing higher-level CSS file when the inline styles are already represented or close enough to belong there.
2. Prefer the highest reasonable shared destination that fits the file’s role.
3. Only create a new shared CSS file when reuse would be incorrect or would create unrelated coupling.
4. Preserve current visual behavior as closely as possible.

## Suggested Reuse Paths
- sample/game debug/meta styles:
  - reuse `samples/shared/sampleBaseLayout.css` if appropriate
  - or reuse an existing higher-level shared debug/theme CSS if already aligned
- server dashboard HTML template styles:
  - reuse a shared server-dashboard CSS file if one exists and is appropriate
  - otherwise create one shared dashboard CSS file under `samples/shared/`
- test page styles:
  - reuse existing shared test CSS if present
  - otherwise create one shared `tests/testBase.css`
- preview generator styles:
  - reuse an existing shared preview CSS if appropriate
  - otherwise create one shared preview CSS under `tools/shared/preview/`
- runtime preview capture styles:
  - reuse an existing sample/shared preview/runtime CSS if appropriate
  - otherwise create one shared runtime preview CSS under `samples/shared/`

## Required Work
1. Remove all remaining inline `<style>` blocks from the listed files.
2. Move the styles into reused higher-level CSS where appropriate.
3. Create new shared CSS files only when reuse would be wrong.
4. Add the correct `<link rel="stylesheet">` references, or equivalent server-rendered stylesheet links for HTML template outputs.
5. Do not leave any inline `<style>` blocks behind in the targeted files.
6. Do not introduce inline `style=""`.
7. Do not introduce JS-generated styling.
8. Preserve existing page behavior/layout as closely as possible.

## Acceptance
- targeted files no longer contain inline `<style>` blocks
- higher-level shared CSS is reused whenever close enough
- new CSS files are created only when necessary
- visual behavior is preserved closely
- no inline `style=""` introduced
- no JS-generated styling introduced
- change is testable
