# Codex Commands - PR_26126_024-preview-generator-v2-examples-order

```bash
codex run "Create PR_26126_024-preview-generator-v2-examples-order. Fix Preview Generator V2 UI text ordering only. Preserve existing generation behavior. Move the \"Games examples\" section (games\\<gamename>\\index.html and <gamename>) so it appears above the \"Samples examples\" section (samples/phase-01/0102/index.html). Do not modify samples. Do not add schema. Produce review artifacts."
```

## Validation Commands

```bash
git diff --check -- tools/preview-generator-v2/index.html docs/dev/codex_commands.md docs/dev/commit_comment.txt
git diff --cached --name-only -- samples games start_of_day tools/shared tools/schemas
npm run test:workspace-v2
npm run codex:review-artifacts
```

```powershell
@'
import { chromium } from '@playwright/test';
import { startRepoServer } from './tests/helpers/playwrightRepoServer.mjs';

const server = await startRepoServer();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];
const consoleErrors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
await page.route('https://cdn.jsdelivr.net/**', async (route) => {
  await route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.html2canvas = window.html2canvas || undefined;' });
});
await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#sampleList');
const placeholder = await page.locator('#sampleList').getAttribute('placeholder');
if (!placeholder) throw new Error('Paths or IDs placeholder is missing.');
const gamesIndex = placeholder.indexOf('Games examples:');
const samplesIndex = placeholder.indexOf('Samples examples:');
const toolsIndex = placeholder.indexOf('Tools examples:');
if (gamesIndex !== 0) throw new Error(`Games examples should be first, got index ${gamesIndex}.`);
if (samplesIndex <= gamesIndex) throw new Error('Samples examples should appear after Games examples.');
if (toolsIndex <= samplesIndex) throw new Error('Tools examples should remain after Samples examples.');
if (!placeholder.includes('games\\<gamename>\\index.html')) throw new Error('Games path example is missing.');
if (!placeholder.includes('samples/phase-01/0102/index.html')) throw new Error('Samples path example is missing.');
if (errors.length || consoleErrors.length) throw new Error([...errors, ...consoleErrors].join(' | '));
await browser.close();
await server.close();
console.log('preview-generator-v2 examples order smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates that the `Paths or IDs` placeholder now renders `Games examples` first, then `Samples examples`, then `Tools examples`, while preserving the expected games and samples example text.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 UI text ordering only.
