# Codex Commands - PR_26126_025-preview-generator-v2-phase-wildcard-support

```bash
codex run "Create PR_26126_025-preview-generator-v2-phase-wildcard-support. Update Preview Generator V2 to support phase-wide sample generation. Add \"samples/phase-xx\" to the Samples examples as a valid input pattern meaning generate previews for all sample images in that phase folder. Implement supporting code so when the Paths or IDs input receives a phase folder pattern such as samples/phase-01 or samples/phase-xx, the tool resolves all eligible sample index.html entries/images under that phase and processes them using the existing preview generation behavior. Preserve existing single sample and game behavior. Do not modify samples. Do not add schema. Produce review artifacts."
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
await page.route('**/samples/phase-01/**/index.html', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><html><body><canvas id="c" width="12" height="12"></canvas><script>const c=document.getElementById("c");const ctx=c.getContext("2d");ctx.fillStyle="#00ff00";ctx.fillRect(0,0,12,12);</script></body></html>'
  });
});
await page.addInitScript(() => {
  const writes = [];
  class FakeFile {
    constructor(text) { this._text = text; }
    async text() { return this._text; }
  }
  class FakeFileHandle {
    constructor(name, path, text = '') { this.kind = 'file'; this.name = name; this.path = path; this._text = text; }
    async getFile() { return new FakeFile(this._text); }
    async createWritable() {
      const handle = this;
      return {
        async write(content) {
          handle._text = String(content);
          writes.push({ path: handle.path, content: String(content) });
        },
        async close() {}
      };
    }
  }
  class FakeDirectoryHandle {
    constructor(name = 'HTML-JavaScript-Gaming', path = '') { this.kind = 'directory'; this.name = name; this.path = path; this.children = new Map(); }
    async getDirectoryHandle(name, options = {}) {
      const key = `dir:${name}`;
      if (!this.children.has(key)) {
        if (!options.create) throw new DOMException('Not found', 'NotFoundError');
        const nextPath = this.path ? `${this.path}/${name}` : name;
        this.children.set(key, new FakeDirectoryHandle(name, nextPath));
      }
      return this.children.get(key);
    }
    async getFileHandle(name, options = {}) {
      const key = `file:${name}`;
      if (!this.children.has(key)) {
        if (!options.create) throw new DOMException('Not found', 'NotFoundError');
        const nextPath = this.path ? `${this.path}/${name}` : name;
        this.children.set(key, new FakeFileHandle(name, nextPath));
      }
      return this.children.get(key);
    }
    async *entries() {
      const sorted = Array.from(this.children.values()).sort((a, b) => b.name.localeCompare(a.name));
      for (const child of sorted) yield [child.name, child];
    }
  }
  async function addFile(root, path, text = '') {
    const parts = path.split('/').filter(Boolean);
    let current = root;
    for (const part of parts.slice(0, -1)) current = await current.getDirectoryHandle(part, { create: true });
    const fileHandle = await current.getFileHandle(parts.at(-1), { create: true });
    fileHandle._text = text;
  }
  async function addDir(root, path) {
    const parts = path.split('/').filter(Boolean);
    let current = root;
    for (const part of parts) current = await current.getDirectoryHandle(part, { create: true });
  }
  window.__previewGeneratorV2Writes = writes;
  window.__previewGeneratorV2Root = new FakeDirectoryHandle();
  window.__previewGeneratorV2Ready = (async () => {
    await addFile(window.__previewGeneratorV2Root, 'samples/phase-01/0101/index.html');
    await addFile(window.__previewGeneratorV2Root, 'samples/phase-01/0102/index.html');
    await addDir(window.__previewGeneratorV2Root, 'samples/phase-01/0199');
  })();
  window.showDirectoryPicker = async () => {
    await window.__previewGeneratorV2Ready;
    return window.__previewGeneratorV2Root;
  };
});

await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#sampleList');
const placeholder = await page.locator('#sampleList').getAttribute('placeholder');
if (!placeholder.includes('samples/phase-xx')) throw new Error('Phase-wide sample example is missing.');
await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '1');
await page.fill('#sampleList', 'samples/phase-01');
await page.check('#targetTypeSamples');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
await page.click('#executeBtn');
await page.waitForFunction(() => document.getElementById('log').textContent.includes('Done.'), null, { timeout: 20000 });
const logText = await page.locator('#log').innerText();
if (!logText.includes('Resolved 2 samples from samples/phase-01.')) throw new Error(`Missing phase resolution log: ${logText}`);
if (!logText.includes('OK   0101') || !logText.includes('OK   0102')) throw new Error(`Expected both phase samples to process: ${logText}`);
if (logText.includes('0199')) throw new Error(`Sample folder without index.html should be skipped: ${logText}`);
const writes = await page.evaluate(() => window.__previewGeneratorV2Writes || []);
const paths = writes.map((write) => write.path).sort();
const expectedPaths = [
  'samples/phase-01/0101/assets/images/preview.svg',
  'samples/phase-01/0102/assets/images/preview.svg'
];
if (JSON.stringify(paths) !== JSON.stringify(expectedPaths)) throw new Error(`Unexpected writes: ${paths.join(' | ')}`);
if (errors.length || consoleErrors.length) throw new Error([...errors, ...consoleErrors].join(' | '));
await browser.close();
await server.close();
console.log('preview-generator-v2 phase-wide sample generation smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted Playwright smoke validates that the `samples/phase-xx` example is present, `samples/phase-01` expands through the selected repo folder into indexed sample entries, non-indexed folders are skipped, and the existing preview generation path writes `preview.svg` for each resolved sample.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 phase-folder resolution and uses targeted browser coverage instead.
