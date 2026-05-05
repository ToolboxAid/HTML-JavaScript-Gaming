# Codex Commands - PR_26126_023-preview-generator-v2-label-consistency

```bash
codex run "Create PR_26126_023-preview-generator-v2-label-consistency. Fix Preview Generator V2 UI labels only. Preserve existing generation behavior. Make the header/title consistent: replace \"Preview SVG Generator > Preview Generator V2\" with \"Preview Generator V2\" and keep \"First-Class Tools Surface\" as the subtitle/context line. Remove duplicate labels inside the Asset folder section so \"Asset folder\" appears only once with value \"assets/images\". Remove duplicate labels inside Capture mode so \"Capture mode\" appears only once. Move \"Canvas Only\" above \"Full Screen (1600x900 HTML Page)\". Do not modify samples. Do not add schema. Produce review artifacts."
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
await page.waitForSelector('#shared-theme-header');
await page.waitForFunction(() => Array.from(document.querySelectorAll('.preview-generator-v2 .accordion-v2__header')).every((header) => header.dataset.accordionV2Bound === 'true'));

const title = await page.title();
if (title !== 'Preview Generator V2') throw new Error(`Unexpected title: ${title}`);
const h1 = await page.locator('.tools-platform-frame__title[data-tool-id="preview-generator-v2"]').innerText();
if (h1.trim() !== 'Preview Generator V2') throw new Error(`Unexpected h1: ${h1}`);
const eyebrow = await page.locator('.tools-platform-frame__eyebrow').innerText();
if (eyebrow.trim() !== 'First-Class Tools Surface') throw new Error(`Unexpected context line: ${eyebrow}`);
const bodyText = await page.locator('body').innerText();
if (bodyText.includes('Preview SVG Generator')) throw new Error('Old Preview SVG Generator label is still visible.');

const assetLabelCount = await page.evaluate(() => (document.body.innerText.match(/Asset folder/g) || []).length);
if (assetLabelCount !== 1) throw new Error(`Expected one visible Asset folder label, got ${assetLabelCount}`);
const assetFolderValue = await page.locator('#assetFolder').inputValue();
if (assetFolderValue !== 'assets/images') throw new Error(`Unexpected asset folder value: ${assetFolderValue}`);
const assetAria = await page.locator('#assetFolder').getAttribute('aria-label');
if (assetAria !== 'Asset folder') throw new Error(`Expected Asset folder aria label, got ${assetAria}`);

const captureLabelCount = await page.evaluate(() => (document.body.innerText.match(/Capture mode/g) || []).length);
if (captureLabelCount !== 1) throw new Error(`Expected one visible Capture mode label, got ${captureLabelCount}`);
const captureTexts = await page.locator('#captureModeContent .preview-generator-v2__radio-option span').evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
const expectedCaptureTexts = ['Canvas Only', 'Full Screen (1600x900 HTML Page)'];
if (JSON.stringify(captureTexts) !== JSON.stringify(expectedCaptureTexts)) throw new Error(`Unexpected capture order: ${captureTexts.join(' | ')}`);
if (!(await page.locator('#captureModeCanvasOnly').isChecked())) throw new Error('Canvas Only should remain selected by default.');
if (await page.locator('legend', { hasText: 'Capture mode' }).count()) throw new Error('Capture mode legend should not render as duplicate label.');

const generateButton = page.locator('#executeBtn');
if (!(await generateButton.isVisible())) throw new Error('Generate Preview button should remain visible.');
if (!(await generateButton.isDisabled())) throw new Error('Generate Preview should remain disabled until required fields are provided.');
if (errors.length || consoleErrors.length) throw new Error([...errors, ...consoleErrors].join(' | '));
await browser.close();
await server.close();
console.log('preview-generator-v2 label consistency smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates the updated title/header labels, confirms the old `Preview SVG Generator` label is not visible, verifies Asset folder and Capture mode each render one visible label, confirms `Canvas Only` is listed before `Full Screen (1600x900 HTML Page)`, and checks the Generate Preview gate remains visible/disabled before required fields are provided.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 labels only.
