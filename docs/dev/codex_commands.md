# Codex Commands - PR_26126_034-preview-generator-v2-cleanup-and-class-review

```bash
codex run "Create PR_26126_034-preview-generator-v2-cleanup-and-class-review. Fix Preview Generator V2 cleanup and structure. Remove legacy tools/preview/* completely. Keep tools/preview-generator-v2 as the active tool. Refactor Preview Generator V2 JavaScript away from one large script body. Use classes for major responsibilities: PreviewGeneratorV2App, PreviewGeneratorV2Ui, PreviewGeneratorV2Capture, PreviewGeneratorV2RepoAccess, PreviewGeneratorV2Logger. Preserve current working behavior exactly. Do not rewrite generation logic. Do not add schema. Do not modify samples. Produce review artifacts and include notes explaining class responsibilities."
```

## Validation Commands

```powershell
node --check tools/preview-generator-v2/previewGeneratorV2.js
@'
const fs = require('fs');
const html = fs.readFileSync('tools/preview-generator-v2/index.html', 'utf8');
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
inlineScripts.forEach((script, index) => {
  new Function(script);
  console.log(`inline script ${index + 1} syntax ok`);
});
'@ | node -
@'
const fs = require('fs');
const js = fs.readFileSync('tools/preview-generator-v2/previewGeneratorV2.js', 'utf8');
for (const name of ['PreviewGeneratorV2App','PreviewGeneratorV2Ui','PreviewGeneratorV2Capture','PreviewGeneratorV2RepoAccess','PreviewGeneratorV2Logger']) {
  if (!js.includes(`class ${name}`)) throw new Error(`Missing class ${name}`);
}
if (!js.includes('new PreviewGeneratorV2App().init();')) throw new Error('App init missing');
console.log('required classes present');
'@ | node -
if (Test-Path tools/preview) { throw 'tools/preview still exists' } else { 'tools/preview removed' }
$legacyMatches = rg -n "preview_svg_generator|tools/preview" tools src docs/design --glob '!docs/dev/reports/*'
if ($LASTEXITCODE -eq 0) { $legacyMatches; throw 'Active legacy preview reference found' }
if ($LASTEXITCODE -eq 1) { 'no active legacy preview references' }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
git diff --check -- tools/preview-generator-v2/index.html tools/preview-generator-v2/previewGeneratorV2.js docs/design/tools/TOOLS_REENGINEERING_INDEX.md docs/dev/codex_commands.md docs/dev/commit_comment.txt docs/dev/reports/preview_generator_v2_class_responsibilities.md docs/dev/reports/codex_review.diff docs/dev/reports/codex_changed_files.txt
npm run test:workspace-v2
```

## Playwright

No new Playwright test was added. This PR restructures Preview Generator V2 JavaScript and removes the legacy preview folder while preserving the existing Preview Generator V2 UI and behavior. `npm run test:workspace-v2` is attempted as the standard command if available.

## Test Notes

`npm run test:workspace-v2` is not defined in the current `package.json`.

## Manual Test

Open Preview Generator V2 from the tool registry. Confirm the tool loads, the repo picker/generate gating/log clear/stop controls still behave as before, and the Last Generated Image and Paths accordion layout from the previous PRs remains intact.
