# Codex Commands - PR_26126_013-preview-generator-v2-reskin-fixes

```bash
codex run "Create PR_26126_013-preview-generator-v2-reskin-fixes. Fix Preview Generator V2 reskin only. Preserve existing preview.html functionality. Remove all copied preview.html CSS and use only Palette Manager V2-style HTML/classes plus Preview Generator V2 wrapper classes where needed. Move STOP into the Palette Manager-style NAV next to Generate Preview. Fix Repo selected so it populates correctly from the selected repo destination/folder. Remove the Repo Sample control entirely. Populate the write folder sample text as \"samples\\phaseXX\\XXXX\\assets\\images\". Ensure Write folder is populated correctly. Remove the \"Paths or IDs\" label/field wrapper from the center column structure shown in preview-generator-v2__paths-field. Move the existing textarea to the top of the layout/control flow. Do not add JSON UI. Do not create schema. Do not modify samples. Update targeted tests if needed and produce review artifacts."
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
    constructor(name = 'SelectedRepoFolder', path = '') {
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
  '#stopBtn',
  '#pickRepoBtn',
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
if (JSON.stringify(menuButtons) !== JSON.stringify(['Generate Preview', 'Stop'])) {
  throw new Error(`Unexpected menu buttons: ${JSON.stringify(menuButtons)}`);
}

const hasCopiedPreviewCss = await page.locator('link[href*="shared/preview/preview-pages.css"]').count();
if (hasCopiedPreviewCss !== 0) {
  throw new Error('Copied preview stylesheet is still loaded.');
}
const copiedClassCounts = await page.evaluate(() => ({
  row: document.querySelectorAll('.row').length,
  inline: document.querySelectorAll('.inline').length,
  inlineLabel: document.querySelectorAll('.inline-label').length,
  valueBox: document.querySelectorAll('.value-box').length,
  pathsField: document.querySelectorAll('.preview-generator-v2__paths-field').length
}));
for (const [name, count] of Object.entries(copiedClassCounts)) {
  if (count !== 0) {
    throw new Error(`Copied preview class still present: ${name}=${count}`);
  }
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
for (const expected of ['Repo Destination', 'Target Source', 'Render Controls', 'Output Summary', 'Status']) {
  if (!sectionNames.includes(expected)) {
    throw new Error(`Missing section: ${expected}`);
  }
}
if (sectionNames.includes('Paths or IDs')) {
  throw new Error('Paths or IDs accordion header should not exist.');
}

if (await page.locator('label[for="sampleList"]').count() !== 0) {
  throw new Error('Paths or IDs field label wrapper should not exist.');
}

const initialSampleText = await page.locator('#writeFolderSampleValue').innerText();
if (initialSampleText !== 'samples\\phaseXX\\XXXX\\assets\\images') {
  throw new Error(`Unexpected write-folder sample text: ${initialSampleText}`);
}

await page.fill('#baseUrl', server.baseUrl);
await page.fill('#waitMs', '3000');
await page.fill('#sampleList', '0107');
await page.check('#forceRewrite');
await page.click('#pickRepoBtn');
await page.waitForFunction(() => !document.getElementById('executeBtn').disabled);
const repoSelected = await page.locator('#repoSelectedValue').innerText();
if (repoSelected !== 'SelectedRepoFolder') {
  throw new Error(`Repo selected did not populate from folder handle: ${repoSelected}`);
}
await page.waitForFunction(() => document.getElementById('writeFolderActualValue').textContent === 'samples\\phase-01\\0107\\assets\\images');
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
console.log('preview-generator-v2 reskin fixes browser smoke valid');
'@ | node --input-type=module -
```

## Notes

The targeted browser smoke validates the Palette Manager-style reskin fixes, confirms Stop is in the nav, verifies the old copied preview CSS/classes are gone, checks the write-folder text behavior, and exercises the existing preview generation write path.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to Preview Generator V2 only.
