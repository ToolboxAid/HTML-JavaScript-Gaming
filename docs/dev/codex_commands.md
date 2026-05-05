# Codex Commands - PR_26126_018-preview-generator-v2-working-accordion-and-status-fix

```bash
codex run "Create PR_26126_018-preview-generator-v2-working-accordion-and-status-fix. Fix Preview Generator V2 UI only. Preserve existing generation behavior. Right column controls must use a working accordion: headers toggle open/closed panels, icons reflect state, and controls remain usable when expanded. Do not leave dead X/underscore controls. Move status text such as \"Ready.\" out of the header/status line and into the textarea/status output area below. Specifically, do not set header/status display to \"Ready.\"; keep repo destination display separate from status output. Ensure setRepoDestinationDisplayName(repoDisplayName) still works, execute button enables correctly, and \"Ready.\" appears only in the lower text/status output area. Do not modify samples. Do not add schema. Produce review artifacts."
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
await page.waitForFunction(() => document.querySelector('#outputSummary .accordion-v2__header')?.dataset.accordionV2Bound === 'true');
await page.waitForFunction(() => document.querySelector('#statusAccordion .accordion-v2__header')?.dataset.accordionV2Bound === 'true');

for (const selector of ['#outputSummary', '#statusAccordion']) {
  const header = page.locator(`${selector} .accordion-v2__header`);
  const content = page.locator(`${selector} .accordion-v2__content`);
  const icon = page.locator(`${selector} .accordion-v2__icon`);
  if (await header.count() !== 1) throw new Error(`${selector} missing accordion header`);
  if (await content.count() !== 1) throw new Error(`${selector} missing accordion content`);
  if (await icon.count() !== 1) throw new Error(`${selector} missing accordion icon`);
  if (await header.getAttribute('aria-expanded') !== 'true') throw new Error(`${selector} should start expanded`);
  await header.click();
  await page.waitForFunction((target) => document.querySelector(`${target} .accordion-v2__header`)?.getAttribute('aria-expanded') === 'false', selector);
  const collapsed = await content.evaluate((node) => ({
    hidden: node.hidden,
    display: getComputedStyle(node).display,
    height: node.getBoundingClientRect().height
  }));
  if (!collapsed.hidden) throw new Error(`${selector} content should be hidden after collapse`);
  if (collapsed.display !== 'none') throw new Error(`${selector} collapsed content display should be none, got ${collapsed.display}`);
  if (collapsed.height !== 0) throw new Error(`${selector} collapsed content height should be 0, got ${collapsed.height}`);
  await header.click();
  await page.waitForFunction((target) => document.querySelector(`${target} .accordion-v2__header`)?.getAttribute('aria-expanded') === 'true', selector);
  if (await content.evaluate((node) => node.hidden) !== false) throw new Error(`${selector} content should be visible after expand`);
}

if (await page.locator('#status').isVisible()) throw new Error('Hidden status display should not be visible.');
const initialLog = await page.locator('#log').innerText();
if (!initialLog.trim().startsWith('Ready.')) throw new Error(`Ready should be in lower log output: ${initialLog}`);
if ((await page.locator('#status').textContent()).includes('Ready.')) throw new Error('Ready should not be set on hidden status display.');
if ((await page.locator('#statusAccordion .accordion-v2__header').innerText()).includes('Ready.')) throw new Error('Ready should not be in Status header.');

await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '3000');
await page.fill('#sampleList', '0107');
await page.check('#forceRewrite');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
const repoSelected = await page.locator('#repoSelectedValue').innerText();
if (repoSelected !== 'HTML-JavaScript-Gaming') throw new Error(`Repo selected did not populate from folder handle: ${repoSelected}`);
if ((await page.locator('#status').textContent()).includes('Ready.')) throw new Error('Repo selection should not set Ready on status display.');
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
console.log('preview-generator-v2 working accordion and status browser smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates that Output Summary and Status are working accordionV2 panels, their headers toggle `aria-expanded`, collapsed panels compute to `display: none` with zero content height, `Ready.` appears only in the lower log output, repo destination display still updates, Generate Preview enables, and the existing preview generation path still writes `preview.svg`.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 UI only.
