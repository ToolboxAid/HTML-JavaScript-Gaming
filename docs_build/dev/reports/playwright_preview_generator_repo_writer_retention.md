# Playwright Preview Generator V2 Repo Writer Retention

## Commands
- `node --check tools/preview-generator-v2/PreviewGeneratorV2App.js`
- `node --check tools/preview-generator-v2/controls/StatusLogControl.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `node --check tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "exports manifests and launches tools from fixed Workspace Manager V2 tiles|keeps Preview Generator V2 repo writer after Asset Manager V2 deletes the preview asset entry|loads Gravity Well and Pong manifests|logs actionable Preview Generator V2 output path resolution failures"`
- `npx playwright test tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs --project=playwright --workers=1 --reporter=list -g "exercises controls, required-field gating, accordions, paths layout, and status clear"`
- `npm run test:workspace-v2`
- `git diff --check`

## Results
- JavaScript syntax checks: passed.
- Focused Workspace Manager V2 / Preview Generator V2 coverage: passed 4/4.
- Focused Preview Generator V2 baseline status-control coverage: passed 1/1.
- Workspace Manager V2 suite: passed 18/18.
- Diff whitespace check: passed.

## Targeted Coverage
- Verified `Copy` appears left of `Clear` in Preview Generator V2 Status controls.
- Verified `Copy` copies the full current status log.
- Verified Copy logs success and missing-Clipboard failure states.
- Verified Preview Generator V2 rehydrates repo selected/file writer context after returning from Asset Manager V2.
- Verified deleting the preview asset entry in Asset Manager V2 does not leave Preview Generator V2 with `Repo selected: not selected`.
- Verified Generate remains enabled when valid repo/game session context exists.
- Verified missing `preview.svg` logs `CHK` with the full absolute path, logs `MISSING`, and generates instead of stale-skipping.
- Verified `OK WRITE` appears after write verification and `Written: 1` follows the verified write path.

## Skipped
- Full samples smoke test was skipped by request. The requested behavior is covered by targeted Playwright flows plus `npm run test:workspace-v2`.
