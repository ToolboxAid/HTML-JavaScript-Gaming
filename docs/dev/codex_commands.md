# Codex Commands - PR_26126_015-preview-generator-v2-output-target-polish

```bash
codex run "Create PR_26126_015-preview-generator-v2-output-target-polish. Fix Preview Generator V2 UI polish only. Preserve existing generation behavior. Output Summary must not show dead accordion controls such as X or underscore unless they work; remove those controls. Status must remain a normal block with no accordion and no X. Update write folder sample labels/values: \"games\\Game Name\" becomes \"games\\<gamename>\", \"tools\\Tool Name\" becomes \"tools\\<toolname>\", and any repeated game example must use \"games\\<gamename>\". In Target type, move Games above Samples and remove the \"Target type\" text label. Render \"Write folder sample\" label/value on two lines with value \"samples\\phaseXX\\XXXX\\assets\\images\". Render \"Write folder\" label/value on two lines with value \"not available yet\". Do not modify samples. Do not add schema. Produce review artifacts."
```

## Validation Commands

```bash
git diff --check -- tools/preview-generator-v2/index.html docs/dev/codex_commands.md docs/dev/commit_comment.txt
git diff --name-only -- samples games start_of_day tools/shared tools/schemas
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
await page.addInitScript(() => {
  const writes = [];
  class FakeFile { constructor(text) { this._text = text; } async text() { return this._text; } }
  class FakeFileHandle {
    constructor(path, existing = null) { this.kind = 'file'; this.name = path.split('/').pop(); this.path = path; this._existing = existing; }
    async getFile() { return new FakeFile(this._existing || ''); }
    async createWritable() { const path = this.path; return { async write(content) { writes.push({ path, content: String(content) }); }, async close() {} }; }
  }
  class FakeDirectoryHandle {
    constructor(name = 'SelectedRepoFolder', path = '') { this.kind = 'directory'; this.name = name; this.path = path; this.children = new Map(); }
    async getDirectoryHandle(name) { const key = `dir:${name}`; if (!this.children.has(key)) { const nextPath = this.path ? `${this.path}/${name}` : name; this.children.set(key, new FakeDirectoryHandle(name, nextPath)); } return this.children.get(key); }
    async getFileHandle(name, options = {}) { const key = `file:${name}`; if (!this.children.has(key)) { if (!options.create) throw new DOMException('Not found', 'NotFoundError'); const nextPath = this.path ? `${this.path}/${name}` : name; this.children.set(key, new FakeFileHandle(nextPath)); } return this.children.get(key); }
  }
  window.__previewGeneratorV2Writes = writes;
  window.showDirectoryPicker = async () => new FakeDirectoryHandle();
});

await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#shared-theme-header');

if (await page.locator('#outputSummary .accordion-v2__icon').count() !== 0) throw new Error('Output Summary still has accordion icon controls.');
if (await page.locator('#outputSummary .accordion-v2__header').count() !== 0) throw new Error('Output Summary still has accordion header controls.');
if (await page.locator('#statusAccordionContent').count() !== 0) throw new Error('Status accordion content still exists.');
if (await page.locator('.preview-generator-v2__status-block .accordion-v2__icon').count() !== 0) throw new Error('Status block still has accordion icon controls.');

const targetLabels = await page.locator('#targetSourceAccordionContent .preview-generator-v2__radio-option span').evaluateAll((items) => items.map((item) => item.textContent.trim()));
if (JSON.stringify(targetLabels) !== JSON.stringify(['Games', 'Samples', 'Tools'])) throw new Error(`Unexpected target order: ${JSON.stringify(targetLabels)}`);
if ((await page.locator('#targetSourceAccordionContent').innerText()).includes('Target type')) throw new Error('Target type text label still visible.');

const initialSampleText = await page.locator('#writeFolderSampleValue').innerText();
if (initialSampleText !== 'samples\\phaseXX\\XXXX\\assets\\images') throw new Error(`Unexpected initial sample text: ${initialSampleText}`);
const initialWriteText = await page.locator('#writeFolderActualValue').innerText();
if (initialWriteText !== 'not available yet') throw new Error(`Unexpected initial write folder text: ${initialWriteText}`);

const summaryFields = await page.locator('#outputSummaryContent .preview-generator-v2__summary-field').evaluateAll((fields) => fields.map((field) => {
  const children = Array.from(field.children);
  return children.map((child) => ({ text: child.textContent.trim(), top: Math.round(child.getBoundingClientRect().top) }));
}));
for (const field of summaryFields) {
  if (field.length !== 2 || field[0].top >= field[1].top) throw new Error(`Summary field is not two-line label/value: ${JSON.stringify(field)}`);
}

const placeholder = await page.locator('#sampleList').getAttribute('placeholder');
if (!placeholder.includes('games\\<gamename>\\index.html')) throw new Error(`Game placeholder not normalized: ${placeholder}`);
if (!placeholder.includes('tools\\<toolname>\\index.html')) throw new Error(`Tool placeholder not normalized: ${placeholder}`);

await page.check('#targetTypeGames');
await page.waitForFunction(() => document.getElementById('writeFolderSampleValue').textContent === 'games\\<gamename>\\assets\\images');
await page.check('#targetTypeTools');
await page.waitForFunction(() => document.getElementById('writeFolderSampleValue').textContent === 'tools\\<toolname>\\assets\\images');
await page.check('#targetTypeSamples');
await page.waitForFunction(() => document.getElementById('writeFolderSampleValue').textContent === 'samples\\phaseXX\\XXXX\\assets\\images');

await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '3000');
await page.fill('#sampleList', '0107');
await page.check('#forceRewrite');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
await page.waitForFunction(() => document.getElementById('writeFolderActualValue').textContent === 'samples\\phase-01\\0107\\assets\\images');
await page.click('#executeBtn');
await page.waitForFunction(() => document.getElementById('log').textContent.includes('===== SUMMARY ====='), null, { timeout: 35000 });
const writes = await page.evaluate(() => window.__previewGeneratorV2Writes || []);
if (writes.length !== 1) throw new Error(`Expected exactly one preview write, got ${writes.length}`);
if (!writes[0].path.endsWith('samples/phase-01/0107/assets/images/preview.svg')) throw new Error(`Unexpected write path: ${writes[0].path}`);
if (!writes[0].content.includes('<svg')) throw new Error('Generated content is not SVG-like.');
if (errors.length || consoleErrors.length) throw new Error([...errors, ...consoleErrors].join(' | '));
await browser.close();
await server.close();
console.log('preview-generator-v2 output target polish browser smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates that Output Summary and Status have no dead accordion controls, target radios display Games/Samples/Tools, placeholder and write-folder sample text uses `<gamename>`/`<toolname>`, summary fields render as label/value rows, and the existing preview generation path still writes `preview.svg`.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 UI polish only.
