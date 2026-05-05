# Codex Commands - PR_26126_012-preview-generator-v2-reskin-from-working-base

```bash
codex run "Create PR_26126_012-preview-generator-v2-reskin-from-working-base. Using tools/preview-generator-v2/index.html (cold copy of preview.html), perform a reskin only. Do not change or break existing functionality, logic, or behavior. Do not remove existing inputs or labels; keep them and regroup them. Apply Palette Manager layout and header. Add NAV using palette-manager-v2__menu-sample with ONLY Generate Preview button. Reorganize UI: Left column groups existing controls into Repo Destination (rename Game Destination; folder selection behavior unchanged), Target Source, and Render Controls. Center column replaces visual Main Preview with a Paths or IDs input box (reuse existing input if present). Right column places Output Summary with Status under it. Do not add JSON UI. Do not create a schema. Do not modify samples. Ensure all existing preview generation still works after layout changes. Produce review artifacts."
```

## Validation Commands

```bash
git diff --check -- tools/preview-generator-v2/index.html tools/toolRegistry.js docs/dev/codex_commands.md docs/dev/commit_comment.txt
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
  if (message.type() === 'error') {
    consoleErrors.push(message.text());
  }
});
await page.route('https://cdn.jsdelivr.net/**', async (route) => {
  await route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.html2canvas = window.html2canvas || undefined;' });
});
await page.addInitScript(() => {
  const writes = [];
  class FakeFile {
    constructor(text) {
      this._text = text;
    }
    async text() {
      return this._text;
    }
  }
  class FakeFileHandle {
    constructor(path, existing = null) {
      this.kind = 'file';
      this.name = path.split('/').pop();
      this.path = path;
      this._existing = existing;
    }
    async getFile() {
      return new FakeFile(this._existing || '');
    }
    async createWritable() {
      const path = this.path;
      return {
        async write(content) {
          writes.push({ path, content: String(content) });
        },
        async close() {}
      };
    }
  }
  class FakeDirectoryHandle {
    constructor(name = 'HTML-JavaScript-Gaming', path = '') {
      this.kind = 'directory';
      this.name = name;
      this.path = path;
      this.children = new Map();
    }
    async getDirectoryHandle(name) {
      const key = `dir:${name}`;
      if (!this.children.has(key)) {
        const nextPath = this.path ? `${this.path}/${name}` : name;
        this.children.set(key, new FakeDirectoryHandle(name, nextPath));
      }
      return this.children.get(key);
    }
    async getFileHandle(name, options = {}) {
      const key = `file:${name}`;
      if (!this.children.has(key)) {
        if (!options.create) {
          throw new DOMException('Not found', 'NotFoundError');
        }
        const nextPath = this.path ? `${this.path}/${name}` : name;
        this.children.set(key, new FakeFileHandle(nextPath));
      }
      return this.children.get(key);
    }
  }
  window.__previewGeneratorV2Writes = writes;
  window.showDirectoryPicker = async () => new FakeDirectoryHandle();
});

await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#shared-theme-header');

const requiredSelectors = [
  '.palette-manager-v2__menu-sample',
  '#executeBtn',
  '#pickRepoBtn',
  '#stopBtn',
  '#targetTypeSamples',
  '#targetTypeGames',
  '#targetTypeTools',
  '#baseUrl',
  '#waitMs',
  '#assetFolder',
  '#forceRewrite',
  '#onlyCaptureTimeout',
  '#captureModeFullScreen',
  '#captureModeCanvasOnly',
  '#sampleList',
  '#repoSelectedValue',
  '#writeFolderSampleValue',
  '#writeFolderActualValue',
  '#status',
  '#log',
  '#frame'
];
for (const selector of requiredSelectors) {
  const locator = page.locator(selector);
  if (await locator.count() !== 1) {
    throw new Error(`Expected one ${selector}`);
  }
}

const menuButtons = await page.locator('.palette-manager-v2__menu-sample button').evaluateAll((buttons) => buttons.map((button) => button.textContent.trim()));
if (JSON.stringify(menuButtons) !== JSON.stringify(['Generate Preview'])) {
  throw new Error(`Unexpected menu buttons: ${JSON.stringify(menuButtons)}`);
}

const forbiddenSelectors = [
  '#applyToGameButton',
  '#exportImageButton',
  '#destinationDataInput',
  'textarea[aria-label*="JSON" i]',
  'textarea[id*="json" i]',
  'pre[id*="json" i]'
];
for (const selector of forbiddenSelectors) {
  if (await page.locator(selector).count() !== 0) {
    throw new Error(`Forbidden JSON/action UI found: ${selector}`);
  }
}

const sectionNames = await page.locator('.accordion-v2__header span:first-child').evaluateAll((items) => items.map((item) => item.textContent.trim()));
for (const expected of ['Repo Destination', 'Target Source', 'Render Controls', 'Paths or IDs', 'Output Summary', 'Status']) {
  if (!sectionNames.includes(expected)) {
    throw new Error(`Missing section: ${expected}`);
  }
}

await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '3000');
await page.fill('#sampleList', '0107');
await page.check('#forceRewrite');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
await page.click('#executeBtn');
await page.waitForFunction(() => document.getElementById('log').textContent.includes('===== SUMMARY ====='), null, { timeout: 35000 });
const writes = await page.evaluate(() => window.__previewGeneratorV2Writes || []);
if (writes.length !== 1) {
  throw new Error(`Expected exactly one preview write, got ${writes.length}`);
}
if (!writes[0].path.endsWith('samples/phase-01/0107/assets/images/preview.svg')) {
  throw new Error(`Unexpected write path: ${writes[0].path}`);
}
if (!writes[0].content.includes('<svg')) {
  throw new Error('Generated content is not SVG-like.');
}
if (errors.length || consoleErrors.length) {
  throw new Error([...errors, ...consoleErrors].join(' | '));
}
await browser.close();
await server.close();
console.log('preview-generator-v2 reskin browser smoke valid');
'@ | node --input-type=module -
```

## Notes

`tools/preview-generator-v2/index.html` remains the cold-copy working generator base with the existing inline generator script and functional element IDs preserved.

The reskin only regroups the existing controls into Palette Manager-style header, menu, panels, and accordion sections. The nav contains only `Generate Preview`, using the existing `executeBtn` behavior.

The targeted Playwright smoke verifies the reskinned layout, absence of JSON/schema UI controls, and the existing generator path by writing a fake `preview.svg` through the File System Access API shim.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 only.
