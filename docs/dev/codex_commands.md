# Codex Commands - PR_26126_019-preview-generator-v2-accordion-status-and-generate-gate

```bash
codex run "Create PR_26126_019-preview-generator-v2-accordion-status-and-generate-gate. Fix Preview Generator V2 UI only. Preserve existing generation behavior. New rule: left and right columns must always use working accordion sections. Restore working accordion behavior on the left column and keep working accordion behavior on the right column. Add a Clear button on the same line as Status to empty the logging/status textarea. Hide Generate Preview until all required fields are provided; do not merely disable it. Add the missing \"Paths or IDs\" header above the input information in the left panel aside. Do not modify samples. Do not add schema. Produce review artifacts."
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
    constructor(name = 'HTML-JavaScript-Gaming', path = '') { this.kind = 'directory'; this.name = name; this.path = path; this.children = new Map(); }
    async getDirectoryHandle(name) { const key = `dir:${name}`; if (!this.children.has(key)) { const nextPath = this.path ? `${this.path}/${name}` : name; this.children.set(key, new FakeDirectoryHandle(name, nextPath)); } return this.children.get(key); }
    async getFileHandle(name, options = {}) { const key = `file:${name}`; if (!this.children.has(key)) { if (!options.create) throw new DOMException('Not found', 'NotFoundError'); const nextPath = this.path ? `${this.path}/${name}` : name; this.children.set(key, new FakeFileHandle(nextPath)); } return this.children.get(key); }
  }
  window.__previewGeneratorV2Writes = writes;
  window.showDirectoryPicker = async () => new FakeDirectoryHandle();
});

await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#shared-theme-header');
await page.waitForFunction(() => Array.from(document.querySelectorAll('.preview-generator-v2 .accordion-v2__header')).every((header) => header.dataset.accordionV2Bound === 'true'));

async function assertAccordion(selector) {
  const header = page.locator(`${selector} .accordion-v2__header`).first();
  const content = page.locator(`${selector} .accordion-v2__content`).first();
  if (await header.count() !== 1) throw new Error(`${selector} missing accordion header`);
  if (await content.count() !== 1) throw new Error(`${selector} missing accordion content`);
  if (await header.getAttribute('aria-expanded') !== 'true') throw new Error(`${selector} should start expanded`);
  await header.click();
  await page.waitForFunction((target) => document.querySelector(`${target} .accordion-v2__header`)?.getAttribute('aria-expanded') === 'false', selector);
  const collapsed = await content.evaluate((node) => ({ hidden: node.hidden, display: getComputedStyle(node).display, height: node.getBoundingClientRect().height }));
  if (!collapsed.hidden) throw new Error(`${selector} should set hidden=true when collapsed`);
  if (collapsed.display !== 'none') throw new Error(`${selector} collapsed display should be none, got ${collapsed.display}`);
  if (collapsed.height !== 0) throw new Error(`${selector} collapsed height should be 0, got ${collapsed.height}`);
  await header.click();
  await page.waitForFunction((target) => document.querySelector(`${target} .accordion-v2__header`)?.getAttribute('aria-expanded') === 'true', selector);
}

for (const selector of [
  '.preview-generator-v2__left-accordion:nth-of-type(1)',
  '.preview-generator-v2__left-accordion:nth-of-type(2)',
  '.preview-generator-v2__left-accordion:nth-of-type(3)',
  '#outputSummary',
  '#statusAccordion'
]) {
  await assertAccordion(selector);
}

if ((await page.locator('#pathsOrIdsTitle').innerText()) !== 'Paths or IDs') throw new Error('Missing Paths or IDs heading.');
if (await page.locator('#executeBtn').isVisible()) throw new Error('Generate Preview should be hidden before required fields are provided.');
await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '3000');
await page.fill('#sampleList', '0107');
await page.check('#forceRewrite');
if (await page.locator('#executeBtn').isVisible()) throw new Error('Generate Preview should remain hidden until repo folder is selected.');
await page.click('#clearLogBtn');
if ((await page.locator('#log').innerText()).trim() !== '') throw new Error('Clear should empty the status log output.');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').hidden && !document.getElementById('executeBtn').disabled);
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
console.log('preview-generator-v2 accordion status generate gate smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates left and right accordion collapse/expand behavior, hidden Generate Preview gating, Status Clear log clearing, the Paths or IDs heading, repo destination display, and preserved preview generation output.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 UI only.
