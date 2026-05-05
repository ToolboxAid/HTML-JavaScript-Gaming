# Codex Commands - PR_26126_028-sample-local-readme-and-fullscreen-capture-fix

```bash
codex run "Create PR_26126_028-sample-local-readme-and-fullscreen-capture-fix. Fix Preview Generator V2 documentation and capture behavior. Add a README.md template under existing sample folders using the pattern samples/phase-xx/XXXX/README.md. The README must explain where the sample implementation actually lives, how the sample folder/index.html launches or bypasses into that code, and how Preview Generator V2 should discover/launch the sample without assuming numeric folders. Do not add a root samples README. Do not modify sample JSON. Also fix Full Screen (1600x900 HTML Page) capture so it does not silently fall back to non-fullscreen capture when html-to-image/html2canvas fails on unsupported CSS color functions such as color(...). For fullscreen mode, capture must either use the intended 1600x900 viewport/full-page path or fail clearly with an actionable error; do not mark OK when fallback was used for fullscreen. Preserve Canvas Only behavior. Produce review artifacts."
```

## Validation Commands

```bash
$sampleDirs = Get-ChildItem samples -Directory -Filter 'phase-*' | Sort-Object Name | ForEach-Object { Get-ChildItem $_.FullName -Directory | Where-Object { $_.Name -match '^\d{4}$' } | Sort-Object FullName }
$missingReadmes = $sampleDirs | Where-Object { !(Test-Path (Join-Path $_.FullName 'README.md')) }
if ($missingReadmes) { $missingReadmes.FullName; throw "Missing sample README files." }
if (Test-Path samples/README.md) { throw "Unexpected root samples/README.md" }
$sampleReadmes = $sampleDirs | ForEach-Object { Join-Path $_.FullName 'README.md' }
rg -n "SAMPLE_LOCAL_CONTRACT_README|Preview Generator V2 discovers samples|SKIP|FAIL|games/<gamename>|index.html is the only discovery" $sampleReadmes
rg -n "Full Screen capture failed|html2canvas may not support CSS color functions|extractBestToolFallbackSvg|using fallback" tools/preview-generator-v2/index.html
git diff --check
git diff --cached --name-only -- '*.json' start_of_day tools/shared tools/schemas
npm run test:workspace-v2
npm test
npm run codex:review-artifacts
```

## Playwright

No Playwright test was added. This PR changes documentation and Preview Generator V2 fullscreen capture error handling only. `npm run test:workspace-v2` was attempted but is not defined in the current `package.json`.

## Test Notes

`npm test` was attempted as the available default test gate and failed in the existing shared extraction guard baseline before this PR's changed Preview Generator V2 code or README files were involved. The reported violations are outside this PR scope.

## Manual Test

Use Preview Generator V2 with Canvas Only to confirm existing canvas capture still works. Use Full Screen (1600x900 HTML Page) on a target with unsupported CSS color functions and confirm it logs a clear `FAIL` instead of silently falling back to a non-fullscreen capture.
