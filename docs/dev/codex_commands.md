# Codex Commands - PR_26126_037-preview-generator-v2-remove-shared-and-consolidate-common

```bash
codex run "Create PR_26126_037-preview-generator-v2-remove-shared-and-consolidate-common. Fix Preview Generator V2 based on audit findings. Preserve existing behavior exactly. Remove all tools/shared dependencies from Preview Generator V2, consolidate safe repeated CSS declarations into common styles, update Preview Generator V2 to consume those common styles, verify Playwright, do not modify samples, do not add schema, do not modify start_of_day folders, and produce required reports."
```

## Validation Commands

```powershell
rg -n "tools/shared|../shared|../../tools/shared|platformShell|shared/" tools/preview-generator-v2 tools/common tests/playwright/PreviewGeneratorV2Baseline.spec.mjs
if ($LASTEXITCODE -eq 1) { Write-Output "no tools/shared references found"; $global:LASTEXITCODE = 0 }
rg -n "<link|<script|import .* from" tools/preview-generator-v2 tools/common tests/playwright/PreviewGeneratorV2Baseline.spec.mjs

$files = Get-ChildItem -Path tools/preview-generator-v2 -Recurse -Filter *.js | Select-Object -ExpandProperty FullName
foreach ($file in $files) {
  node --check $file
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node --check tests/playwright/PreviewGeneratorV2Baseline.spec.mjs
npx playwright test tests/playwright/PreviewGeneratorV2Baseline.spec.mjs --project=playwright --reporter=list
git status --short -- samples tools/schemas start_of_day tests/results
git diff --check -- tools/preview-generator-v2 tools/common tests/playwright docs/dev/codex_commands.md docs/dev/commit_comment.txt docs/dev/reports/preview_generator_v2_shared_removed.txt docs/dev/reports/preview_generator_v2_common_styles_applied.txt docs/dev/reports/preview_generator_v2_playwright_result.txt
npm run test:workspace-v2
```

## Playwright

Playwright validates that Preview Generator V2 launches, the main shell/menu/status controls render, Generate Preview and Stop start disabled, Games is the default target source, a working accordion collapses/reopens, the common stylesheet loads, and the consolidated common style declarations are active.

Expected pass behavior: the targeted Playwright test passes with one launched tool page and no page errors.

Expected fail behavior: the test fails if the tool cannot load, controls are missing, common styles are not applied, accordion behavior is broken, or page errors are emitted.

## Test Notes

`npm run test:workspace-v2` is not defined in the current `package.json`.

## Manual Test

Open `tools/preview-generator-v2/index.html`, confirm the tool shell looks unchanged, toggle Repo Destination, use Hide Header and Details/Show Header and Details, and confirm Generate Preview remains visible but disabled before required fields are complete.

Full samples smoke test was skipped because this PR does not modify samples or shared sample loading.
