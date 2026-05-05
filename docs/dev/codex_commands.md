# Codex Commands - PR_26126_036-preview-generator-v2-shared-dependency-and-style-audit

```bash
codex run "Create PR_26126_036-preview-generator-v2-shared-dependency-and-style-audit. Audit Preview Generator V2 structure and validation only. Verify tools/shared dependencies, report common CSS declaration candidates by comparing declaration bodies, verify Playwright launches Preview Generator V2, repair minimal Playwright coverage only if needed, do not modify samples, do not add schema, do not modify start_of_day folders, and produce required review artifacts."
```

## Validation Commands

```powershell
rg -n "tools/shared|../shared|../../tools/shared|platformShell|shared/" tools/preview-generator-v2 tests/playwright/PreviewGeneratorV2Baseline.spec.mjs
if ($LASTEXITCODE -eq 1) { Write-Output "no tools/shared references found"; $global:LASTEXITCODE = 0 }
rg -n "<link|<script|import .* from" tools/preview-generator-v2 tests/playwright/PreviewGeneratorV2Baseline.spec.mjs

$files = Get-ChildItem -Path tools/preview-generator-v2 -Recurse -Filter *.js | Select-Object -ExpandProperty FullName
foreach ($file in $files) {
  node --check $file
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node --check tests/playwright/PreviewGeneratorV2Baseline.spec.mjs
npx playwright test tests/playwright/PreviewGeneratorV2Baseline.spec.mjs --project=playwright --reporter=list
git status --short -- samples tools/schemas start_of_day
git diff --check -- tools/preview-generator-v2 tests/playwright docs/dev/codex_commands.md docs/dev/commit_comment.txt docs/dev/reports/preview_generator_v2_shared_dependency_audit.txt docs/dev/reports/preview_generator_v2_common_style_candidates.txt docs/dev/reports/preview_generator_v2_playwright_result.txt
npm run test:workspace-v2
```

## Playwright

Playwright validates that Preview Generator V2 launches, the main shell/menu/status controls render, Generate Preview and Stop start disabled, Games is the default target source, and a working accordion collapses/reopens without page errors.

Expected pass behavior: the targeted Playwright test passes with one launched tool page.

Expected fail behavior: the test fails if the tool cannot load, controls are missing, the default target source changes unexpectedly, accordion behavior is broken, or page errors are emitted.

## Test Notes

`npm run test:workspace-v2` is not defined in the current `package.json`.

## Manual Test

Open `tools/preview-generator-v2/index.html`, confirm the tool shell loads, toggle Repo Destination, confirm Generate Preview is visible but disabled before required fields are complete, and verify Status/Clear remain visible.

Full samples smoke test was skipped because this PR does not modify samples or shared sample loading.
