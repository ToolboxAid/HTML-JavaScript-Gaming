# PR_26126_110 Manual Validation Notes

## Commands
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"`
- `node --check tests\playwright\tools\AssetManagerV2.spec.mjs`
- `node --check tests\playwright\tools\PreviewGeneratorV2Baseline.spec.mjs`
- `npm run test:asset-manager-v2`
- `npm run test:preview-generator-v2`
- `npm run test:workspace-v2`
- `git diff --check`

## Results
- `package.json` parses successfully after script path updates.
- Asset Manager V2 and Preview Generator V2 moved specs pass JavaScript syntax checks.
- `npm run test:asset-manager-v2` passed 7/7 Playwright tests.
- `npm run test:preview-generator-v2` passed 7/7 Playwright tests.
- `npm run test:workspace-v2` passed 14/14 Playwright tests.
- `?workspace=prod` hard-fails to the Asset Manager V2 launch guard overlay.
- Valid Workspace Manager session launch remains the production access path.
- Full samples smoke test skipped: this PR changes tool Playwright spec locations, npm script paths, and launch-guard test coverage only.
- No sample JSON was modified.
