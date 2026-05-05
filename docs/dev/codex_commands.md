# Codex Commands - PR_26126_035-preview-generator-v2-file-split-and-control-classes

```bash
codex run "Create PR_26126_035-preview-generator-v2-file-split-and-control-classes. Fix Preview Generator V2 structure only. Preserve current working behavior exactly. Remove all inline style blocks and inline script blocks from tools/preview-generator-v2/index.html. Move CSS into external stylesheet files. Move JavaScript into external module files. Use one class per JavaScript file. Give each UI control/section its own class. Keep a small app/bootstrap entry file only for wiring classes together. Preserve existing IDs and DOM behavior unless a rename is required for correctness. Do not rewrite generation logic. Do not add schema. Do not modify samples. Do not modify start_of_day folders. Produce review artifacts and class ownership notes."
```

## Validation Commands

```powershell
$files = Get-ChildItem -Path tools/preview-generator-v2 -Recurse -Filter *.js | Select-Object -ExpandProperty FullName
foreach ($file in $files) {
  node --check $file
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
@'
const fs = require('fs');
const html = fs.readFileSync('tools/preview-generator-v2/index.html', 'utf8');
if (/<style\b/i.test(html) || /<\/style>/i.test(html)) throw new Error('Inline style block remains');
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/gi)];
if (inlineScripts.length) throw new Error(`Inline script block remains: ${inlineScripts.length}`);
if (!html.includes('./previewGeneratorV2.css')) throw new Error('External CSS link missing');
if (!html.includes('./previewGeneratorV2.bootstrap.js')) throw new Error('Bootstrap module missing');
console.log('index has no inline style/script blocks');
'@ | node -
@'
const fs = require('fs');
const path = require('path');
const root = 'tools/preview-generator-v2';
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
}
walk(root);
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const classes = [...text.matchAll(/\bclass\s+[A-Za-z0-9_]+/g)].map(match => match[0]);
  if (classes.length > 1) throw new Error(`${file} has more than one class: ${classes.join(', ')}`);
}
console.log('one class per js file check ok');
'@ | node -
@'
const fs = require('fs');
const path = require('path');
const root = 'tools/preview-generator-v2';
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
}
walk(root);
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/from\s+["'](.+?)["']/g)) {
    const target = path.resolve(path.dirname(file), match[1]);
    if (!fs.existsSync(target)) throw new Error(`${file} imports missing ${match[1]}`);
  }
}
console.log('local module imports resolve');
'@ | node -
git status --short -- samples tools/schemas start_of_day
git diff --check -- tools/preview-generator-v2 docs/dev/codex_commands.md docs/dev/commit_comment.txt docs/dev/reports/preview_generator_v2_class_responsibilities.md docs/dev/reports/codex_review.diff docs/dev/reports/codex_changed_files.txt
npm run test:workspace-v2
```

## Playwright

No new Playwright test was added. This PR is a file split and class ownership cleanup for Preview Generator V2 only; existing behavior is intended to remain unchanged. `npm run test:workspace-v2` is attempted as the standard command if available.

## Test Notes

`npm run test:workspace-v2` is not defined in the current `package.json`.

## Manual Test

Open Preview Generator V2 and confirm the page loads with the same layout and controls. Pick a repo, verify Generate Preview gating, run a small known path, use Stop/Clear, and confirm Last Generated Image and Output Summary update as before.
