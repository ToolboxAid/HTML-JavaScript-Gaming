# Codex Commands - PR_26126_021-preview-generator-v2-last-generated-placement

```bash
codex run "Create PR_26126_021-preview-generator-v2-last-generated-placement. Fix Preview Generator V2 UI only. Preserve existing generation behavior. Under the \"Paths or IDs\" control in the left panel, add a \"Last Generated Image\" section that displays the most recently generated preview. This must update on every Generate Preview action, replace the previous image (no history), and show an empty state before first generate. Keep it within the left panel accordion flow, directly below the Paths or IDs control. Do not move existing controls. Do not modify samples. Do not add schema. Produce review artifacts."
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

const textareaBox = await page.locator('#sampleList').boundingBox();
const lastGeneratedBox = await page.locator('#lastGeneratedImageSection').boundingBox();
if (!textareaBox || !lastGeneratedBox || lastGeneratedBox.y <= textareaBox.y) throw new Error('Last Generated Image should render below Paths or IDs input.');
if (!(await page.locator('#lastGeneratedImageEmpty').isVisible())) throw new Error('Last Generated Image empty state should be visible before first generate.');
if (await page.locator('#lastGeneratedImagePreview').isVisible()) throw new Error('Last Generated Image preview should be hidden before first generate.');

await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '3000');
await page.fill('#sampleList', '0107');
await page.check('#forceRewrite');
await page.check('#targetTypeSamples');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
await page.click('#executeBtn');
await page.waitForFunction(() => document.getElementById('lastGeneratedImagePreview') && !document.getElementById('lastGeneratedImagePreview').hidden, null, { timeout: 35000 });
if (await page.locator('#lastGeneratedImageEmpty').isVisible()) throw new Error('Last Generated Image empty state should hide after generate.');
const firstSrc = await page.locator('#lastGeneratedImage').getAttribute('src');
const firstMeta = await page.locator('#lastGeneratedImageMeta').innerText();
if (!firstSrc?.startsWith('blob:')) throw new Error(`Last Generated Image should use an object URL, got ${firstSrc}`);
if (!firstMeta.includes('0107')) throw new Error(`Last Generated Image meta should include first generated label, got ${firstMeta}`);
await page.waitForFunction(() => (window.__previewGeneratorV2Writes || []).length === 1);

await page.fill('#sampleList', '0102');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
await page.click('#executeBtn');
await page.waitForFunction((previousSrc) => {
  const img = document.getElementById('lastGeneratedImage');
  return img && img.getAttribute('src') && img.getAttribute('src') !== previousSrc;
}, firstSrc, { timeout: 35000 });
const secondSrc = await page.locator('#lastGeneratedImage').getAttribute('src');
const secondMeta = await page.locator('#lastGeneratedImageMeta').innerText();
if (!secondSrc?.startsWith('blob:')) throw new Error(`Replacement Last Generated Image should use an object URL, got ${secondSrc}`);
if (secondSrc === firstSrc) throw new Error('Last Generated Image should replace the prior object URL.');
if (!secondMeta.includes('0102')) throw new Error(`Last Generated Image meta should include second generated label, got ${secondMeta}`);
await page.waitForFunction(() => (window.__previewGeneratorV2Writes || []).length === 2);
const writes = await page.evaluate(() => window.__previewGeneratorV2Writes || []);
if (!writes[0].path.endsWith('samples/phase-01/0107/assets/images/preview.svg')) throw new Error(`Unexpected first write path: ${writes[0].path}`);
if (!writes[1].path.endsWith('samples/phase-01/0102/assets/images/preview.svg')) throw new Error(`Unexpected second write path: ${writes[1].path}`);
if (errors.length || consoleErrors.length) throw new Error([...errors, ...consoleErrors].join(' | '));
await browser.close();
await server.close();
console.log('preview-generator-v2 last generated image placement smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates the empty state, placement below `Paths or IDs`, first generated preview render, and second Generate Preview replacement without history.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 UI only.

An unrelated unstaged sample preview SVG change was present before this PR and was left untouched.
