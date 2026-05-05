# Codex Commands - PR_26126_033-preview-generator-v2-paths-stretch-layout

```bash
codex run "Create PR_26126_033-preview-generator-v2-paths-stretch-layout. Fix Preview Generator V2 layout only. Preserve existing generation behavior. In the left column, make the \"Paths or IDs\" accordion section stretch to fill all remaining vertical space down to the bottom of the panel above \"Last Generated Image\". Implement using flex layout: left panel column must be a flex container with column direction; set the Paths or IDs section to flex-grow:1 and its textarea to height:100% (or flex:1) so it expands fully. Do not use inline styles. Keep Last Generated Image fixed height below it. Do not modify samples. Do not add schema. Produce review artifacts."
```

## Validation Commands

```powershell
@'
const fs = require('fs');
const html = fs.readFileSync('tools/preview-generator-v2/index.html', 'utf8');
const required = [
  '.preview-generator-v2__center-panel .preview-generator-v2__paths-section',
  'flex: 1 1 auto;',
  '.preview-generator-v2__paths-section .accordion-v2__content',
  'height: 100%;',
  '.preview-generator-v2__center-panel .preview-generator-v2__last-generated-section',
  'flex: 0 0 auto;',
  'preview-generator-v2__paths-section is-open'
];
for (const token of required) {
  if (!html.includes(token)) throw new Error(`Missing layout token: ${token}`);
}
if (/<[^>]+style=/.test(html)) throw new Error('Inline style attribute found');
console.log('paths stretch layout tokens ok');
'@ | node -
@'
const fs = require('fs');
const html = fs.readFileSync('tools/preview-generator-v2/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
scripts.forEach((script, index) => {
  new Function(script);
  console.log(`inline script ${index + 1} syntax ok`);
});
'@ | node -
git diff --check -- tools/preview-generator-v2/index.html docs/dev/codex_commands.md docs/dev/commit_comment.txt docs/dev/reports/codex_review.diff docs/dev/reports/codex_changed_files.txt
npm run test:workspace-v2
```

## Playwright

No new Playwright test was added. This PR changes Preview Generator V2 layout CSS/section classing only, with existing `accordionV2` behavior unchanged. `npm run test:workspace-v2` is attempted as the standard command if available.

## Test Notes

`npm run test:workspace-v2` is not defined in the current `package.json`.

## Manual Test

Open Preview Generator V2 and confirm the `Paths or IDs` accordion stretches through the available column height above `Last Generated Image`. Confirm the `Paths or IDs` textarea grows with the section, `Last Generated Image` stays fixed below it, and generation behavior is unchanged.
