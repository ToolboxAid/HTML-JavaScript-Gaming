# Codex Commands - PR_26126_030-preview-generator-v2-status-header-and-fullscreen-css-fix

```bash
codex run "Create PR_26126_030-preview-generator-v2-status-header-and-fullscreen-css-fix. Fix Preview Generator V2 UI/capture only. Preserve existing generation behavior. Status must not render accordion affordances; remove the \"+\" from the Status header. Keep Clear on the same line as Status, but render it as a normal button, not accordion UI. Fix Full Screen capture failure caused by unsupported CSS color(...) values by sanitizing/normalizing unsupported CSS color functions only for the cloned capture DOM before html2canvas runs. Do not change live page styling. Do not fall back silently. Full Screen should succeed when the only blocker is unsupported CSS color(...). Preserve Canvas Only behavior. Do not modify samples. Do not add schema. Produce review artifacts."
```

## Validation Commands

```bash
rg -n "statusAccordion|Status|accordion-v2__icon|preview-generator-v2__status-header-row|preview-generator-v2__status-content|replaceUnsupportedColorFunctions|sanitizeComputedColorStyles|sanitizeClonedToolDocument|onclone" tools/preview-generator-v2/index.html
node -e "const fs=require('fs');const html=fs.readFileSync('tools/preview-generator-v2/index.html','utf8');const status=html.match(/<section id=\"statusAccordion\"[\\s\\S]*?<\\/section>/)?.[0]||'';if(!status)throw new Error('Missing status section');if(status.includes('accordion-v2__icon')||status.includes('accordion-v2__header'))throw new Error('Status still has accordion affordance markup');console.log('status section has no accordion affordance');"
node -e "const fs=require('fs');const html=fs.readFileSync('tools/preview-generator-v2/index.html','utf8');const scripts=[...html.matchAll(/<script(?![^>]*\\bsrc=)[^>]*>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]);scripts.forEach((script,i)=>{new Function(script);console.log('inline script '+(i+1)+' syntax ok');});"
git diff --check
git diff --name-only -- '*.json' tools/shared tools/schemas start_of_day
npm run test:workspace-v2
npm test
```

## Playwright

No Playwright test was added. This PR changes Preview Generator V2 status header markup and cloned-DOM fullscreen capture sanitization only. `npm run test:workspace-v2` is attempted as the standard command if available.

## Test Notes

`npm run test:workspace-v2` is not defined in the current `package.json`. `npm test` was attempted and still fails in the existing shared extraction guard baseline, outside this PR scope.

## Manual Test

Open Preview Generator V2 and confirm Status has no accordion plus/minus affordance, with Clear on the same line. Run Full Screen capture against a page whose only blocker is CSS `color(...)` and confirm it no longer fails for that parser error. Recheck Canvas Only capture still works.
