# PR_26126_107 Manual Validation Notes

## Commands
- `node --check toolbox/asset-manager-v2/js/AssetManagerV2App.js`
- `rg -n "exportAssets\\(|exportToolState\\(|copyAssetsJson\\(" toolbox\asset-manager-v2 tests\playwright\AssetManagerV2.spec.mjs tests\playwright\PreviewGeneratorV2Baseline.spec.mjs`
- `rg -n "KeyD|KeyA|KeyS|KeyW|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|PageUp|PageDown|Enter|keydown|keyup" toolbox\asset-manager-v2 tests\playwright\AssetManagerV2.spec.mjs`
- `git diff -- package.json tests\playwright\PreviewGeneratorV2Baseline.spec.mjs`
- `git diff --check`
- `npm run test:workspace-v2`

## Results
- `npm run test:workspace-v2` passed 14/14 Playwright tests.
- Removed dead Asset Manager V2 methods are absent from source and tests.
- Active Asset Manager V2 source/tests contain no listed keyboard-navigation key handling or assertions.
- Asset Manager V2 temporary UAT launch is validated with lowercase `?workspace=uat`.
- `package.json` and `PreviewGeneratorV2Baseline.spec.mjs` have no PR_26126_107 diff.
- Asset Manager V2 tests remain in `tests/playwright/AssetManagerV2.spec.mjs`.
- Historical PR report churn from PR_26126_106 was reverted for the requested report files.
- No sample JSON was modified.
