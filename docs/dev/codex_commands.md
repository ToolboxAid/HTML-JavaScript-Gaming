# Codex Commands - PR_26126_011-preview-generator-v2-rollback-and-cold-copy

```bash
codex run "Create PR_26126_011-preview-generator-v2-rollback-and-cold-copy. Roll back all Preview Generator V2 changes made after the repo state before Preview Generator V2 was created. Remove the failed Preview Generator V2 implementation/docs/test changes from PR_26126_008 through PR_26126_010 unless needed only as review artifacts. Then create tools/preview-generator-v2/index.html by copying existing working preview.html cold as-is with no reskin, no rewrite, no renamed labels, no regrouping, no new controls, no removed controls, and no behavior changes. Preserve existing functionality exactly. Do not create a Preview Generator V2 schema. Do not modify samples. Add only the minimum registration/linking needed to open the new tool if required. Produce review artifacts showing rollback plus cold-copy result."
```

## Validation Commands

```bash
Get-FileHash tools/preview/preview_svg_generator.html, tools/preview-generator-v2/index.html -Algorithm SHA256
node --input-type=module -e "import('./tools/toolRegistry.js').then(({getToolById})=>{const tool=getToolById('preview-generator-v2'); if(!tool || tool.entryPoint !== 'preview-generator-v2/index.html') throw new Error('preview-generator-v2 registry entry invalid'); console.log('preview-generator-v2 registry entry valid');})"
node --input-type=module -e "import { chromium } from '@playwright/test'; import { startRepoServer } from './tests/helpers/playwrightRepoServer.mjs'; const server=await startRepoServer(); const browser=await chromium.launch({headless:true}); const page=await browser.newPage({viewport:{width:1280,height:900}}); const errors=[]; page.on('pageerror', error=>errors.push(error.message)); await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, {waitUntil:'networkidle'}); if (await page.locator('h1').innerText() !== 'Preview SVG Generator') throw new Error('cold-copy heading mismatch'); if (await page.locator('#executeBtn').count() !== 1) throw new Error('executeBtn missing'); if (await page.locator('input[name=\"targetType\"]').count() !== 3) throw new Error('targetType radios missing'); if (await page.locator('#sampleList').count() !== 1) throw new Error('sampleList missing'); if (await page.locator('.preview-generator-v2, [data-preview-generator-v2-header], #shared-theme-header').count() !== 0) throw new Error('reskin shell still present'); if (errors.length) throw new Error(errors.join(' | ')); await browser.close(); await server.close(); console.log('preview-generator-v2 cold-copy browser smoke valid');"
git diff --check -- tools/preview-generator-v2/index.html tools/toolRegistry.js docs/dev/codex_commands.md docs/dev/commit_comment.txt
npm run test:workspace-v2
npm run codex:review-artifacts
```

## Notes

`tools/preview/preview_svg_generator.html` was used as the existing working preview generator because there is no literal `preview.html` file in the repository.

`npm run test:workspace-v2` was attempted, but the script is not defined in this checkout.

Full samples smoke test was skipped because this PR is scoped to rolling back Preview Generator V2 and cold-copying one tool file.
