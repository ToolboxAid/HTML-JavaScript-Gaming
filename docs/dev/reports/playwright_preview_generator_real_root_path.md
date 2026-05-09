# Playwright Preview Generator V2 Real Root Path

## Commands
- `node --check tools/preview-generator-v2/PreviewGeneratorV2App.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "exports manifests and launches tools from fixed Workspace Manager V2 tiles|logs actionable Preview Generator V2 output path resolution failures|loads Gravity Well and Pong manifests"`
- `npm run test:workspace-v2`
- `git diff --check`

## Results
- JavaScript syntax checks: passed.
- Focused Preview Generator V2 real-root-path coverage: passed 3/3.
- Workspace Manager V2 suite: passed 17/17.
- Diff whitespace check: passed.

## Targeted Coverage
- Generated a Pong preview with Force rewrite enabled.
- Verified the log shows the actual repo root:
  - `Repo root: C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming`
- Verified the log shows:
  - `Resolved relative output path: games/Pong/assets/images/preview.svg`
  - `Full absolute output path: C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\games\Pong\assets\images\preview.svg`
- Verified `OK WRITE Pong` appears only after write verification passes.
- Verified Force rewrite logs replacement verification after write read-back succeeds.
- Verified summary `Written: 1` appears only for the verified write path.
- Verified missing repo root state logs `FAIL` and does not log `OK WRITE`.

## Skipped
- Full samples smoke test was skipped by request. The required Preview Generator V2 path, verification, force-rewrite, failure, and Workspace launch paths are covered by `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
