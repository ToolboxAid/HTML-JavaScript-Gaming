# Codex Commands - PR_26126_022-preview-generator-v2-no-inline-style-and-auto-rewrite

```bash
codex run "Create PR_26126_022-preview-generator-v2-no-inline-style-and-auto-rewrite. Fix Preview Generator V2 UI/behavior only. Preserve existing generation behavior. Remove all inline style attributes from HTML; move styling into the existing Preview Generator V2 stylesheet/classes using Palette Manager V2 style conventions. Do not show the text \"Only rewrite if preview.svg contains literal \\\"Capture timeout\\\"\" in the UI. Instead, if an existing preview.svg exists, automatically test its contents; only rewrite/regenerate when preview.svg contains the literal text \"Capture timeout\". If preview.svg exists and does not contain that text, skip rewrite and log the decision in the status textarea. Do not modify samples. Do not add schema. Produce review artifacts."
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
    async createWritable() { const handle = this; const path = this.path; return { async write(content) { writes.push({ path, content: String(content) }); handle._existing = String(content); }, async close() {} }; }
  }
  class FakeDirectoryHandle {
    constructor(name = 'HTML-JavaScript-Gaming', path = '') { this.kind = 'directory'; this.name = name; this.path = path; this.children = new Map(); }
    async getDirectoryHandle(name) { const key = `dir:${name}`; if (!this.children.has(key)) { const nextPath = this.path ? `${this.path}/${name}` : name; this.children.set(key, new FakeDirectoryHandle(name, nextPath)); } return this.children.get(key); }
    async getFileHandle(name, options = {}) { const key = `file:${name}`; if (!this.children.has(key)) { if (!options.create) throw new DOMException('Not found', 'NotFoundError'); const nextPath = this.path ? `${this.path}/${name}` : name; this.children.set(key, new FakeFileHandle(nextPath)); } return this.children.get(key); }
  }
  async function addFile(root, path, text) {
    const parts = path.split('/').filter(Boolean);
    let current = root;
    for (const part of parts.slice(0, -1)) current = await current.getDirectoryHandle(part);
    const fileHandle = await current.getFileHandle(parts.at(-1), { create: true });
    fileHandle._existing = text;
  }
  window.__previewGeneratorV2Writes = writes;
  window.__previewGeneratorV2Root = new FakeDirectoryHandle();
  window.__previewGeneratorV2Ready = (async () => {
    await addFile(window.__previewGeneratorV2Root, 'samples/phase-01/0107/assets/images/preview.svg', '<svg><text>Healthy preview</text></svg>');
    await addFile(window.__previewGeneratorV2Root, 'samples/phase-01/0102/assets/images/preview.svg', '<svg><text>Capture timeout</text></svg>');
  })();
  window.showDirectoryPicker = async () => {
    await window.__previewGeneratorV2Ready;
    return window.__previewGeneratorV2Root;
  };
});

await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#shared-theme-header');
await page.waitForFunction(() => Array.from(document.querySelectorAll('.preview-generator-v2 .accordion-v2__header')).every((header) => header.dataset.accordionV2Bound === 'true'));
const bodyText = await page.locator('body').innerText();
if (bodyText.includes('Only rewrite if preview.svg contains literal')) throw new Error('Manual capture-timeout rewrite text should not be visible.');
const previewInlineStyleCount = await page.locator('.preview-generator-v2 [style]').count();
if (previewInlineStyleCount !== 0) throw new Error(`Expected no inline style attributes inside Preview Generator V2 UI, got ${previewInlineStyleCount}`);

await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '3000');
await page.fill('#sampleList', '0107');
await page.check('#targetTypeSamples');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
await page.click('#executeBtn');
await page.waitForFunction(() => document.getElementById('log').textContent.includes('existing-preview-without-capture-timeout'), null, { timeout: 35000 });
let writes = await page.evaluate(() => window.__previewGeneratorV2Writes || []);
if (writes.length !== 0) throw new Error(`Existing healthy preview should skip rewrite, got ${writes.length} writes.`);

await page.click('#clearLogBtn');
await page.fill('#sampleList', '0102');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
await page.click('#executeBtn');
await page.waitForFunction(() => document.getElementById('log').textContent.includes('contains Capture timeout; rewriting'), null, { timeout: 35000 });
await page.waitForFunction(() => document.getElementById('lastGeneratedImagePreview') && !document.getElementById('lastGeneratedImagePreview').hidden, null, { timeout: 35000 });
writes = await page.evaluate(() => window.__previewGeneratorV2Writes || []);
if (writes.length !== 1) throw new Error(`Existing Capture timeout preview should rewrite once, got ${writes.length} writes.`);
if (!writes[0].path.endsWith('samples/phase-01/0102/assets/images/preview.svg')) throw new Error(`Unexpected rewrite path: ${writes[0].path}`);
if (errors.length || consoleErrors.length) throw new Error([...errors, ...consoleErrors].join(' | '));
await browser.close();
await server.close();
console.log('preview-generator-v2 automatic capture-timeout rewrite gate smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates the visible manual capture-timeout checkbox text is absent, Preview Generator V2-owned UI has no inline style attributes, existing healthy previews skip rewrite with a status log, and existing timeout previews rewrite and update Last Generated Image.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 UI/behavior only.

Unstaged sample preview SVG changes were present before this PR and were left untouched.
