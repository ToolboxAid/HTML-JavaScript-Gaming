# Codex Commands - PR_26126_029-preview-generator-v2-fullscreen-native-size

```bash
codex run "Create PR_26126_029-preview-generator-v2-fullscreen-native-size. Fix Preview Generator V2 fullscreen capture wording and behavior only. Preserve existing generation behavior. Full Screen capture must not require 1600x900; use the actual available fullscreen/browser viewport size. Update Capture mode label from \"Full Screen (1600x900 HTML Page)\" to \"Full Screen\". Remove hardcoded 1600x900 wording from UI, logs, errors, and tests. If fullscreen capture fails, report \"Full Screen capture failed\" with the underlying error, not \"failed at 1600x900\". Preserve Canvas Only behavior. Do not modify samples. Do not add schema. Produce review artifacts."
```

## Validation Commands

```bash
rg -n "1600|900|1600x900|fullscreen1600|Full Screen \\(|failed at" tools/preview-generator-v2/index.html
rg -n "Full Screen capture failed|Full Screen|Canvas Only|fullscreen|getAvailableFullScreenCaptureSize|extractFullPageSvg" tools/preview-generator-v2/index.html
node -e "const fs=require('fs');const html=fs.readFileSync('tools/preview-generator-v2/index.html','utf8');const scripts=[...html.matchAll(/<script(?![^>]*\\bsrc=)[^>]*>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]);scripts.forEach((script,i)=>{new Function(script);console.log('inline script '+(i+1)+' syntax ok');});"
git diff --check
git diff --name-only -- tools/preview-generator-v2/index.html docs/dev/codex_commands.md docs/dev/commit_comment.txt docs/dev/reports/codex_changed_files.txt docs/dev/reports/codex_review.diff
git diff --name-only -- '*.json' tools/shared tools/schemas start_of_day
npm run test:workspace-v2
npm test
```

## Playwright

No Playwright test was added. This PR changes Preview Generator V2 fullscreen capture wording and capture sizing only. `npm run test:workspace-v2` is attempted as the standard command if available.

## Test Notes

`npm run test:workspace-v2` is not defined in the current `package.json`. `npm test` was attempted and still fails in the existing shared extraction guard baseline, outside this PR scope.

## Manual Test

Use Preview Generator V2 with Canvas Only to confirm existing canvas capture still works. Use Full Screen on a target with unsupported fullscreen capture CSS and confirm it logs `Full Screen capture failed: <underlying error>` without fallback or fixed-size wording.
