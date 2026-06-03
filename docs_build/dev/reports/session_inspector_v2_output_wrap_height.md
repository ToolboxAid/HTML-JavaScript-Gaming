# PR_26128_025 Session Inspector V2 Output Wrap Height

## Scope
- Updated Session Inspector V2 detail output styling only.
- Kept JSON, Data, and Dirty output scroll ownership on their own `<pre>` elements.
- Preserved normalized session object shape and existing Copy All, Clear Status, and Dirty header behavior.

## Changes
- Added a shared Session Inspector V2 output height token and applied it to JSON, Data, Dirty, and Status outputs.
- Changed JSON/Data/Dirty outputs to wrap long lines with `pre-wrap`, `overflow-wrap: anywhere`, and no horizontal output scrollbar.
- Kept vertical scrolling inside JSON/Data/Dirty `<pre>` elements.
- Let the right detail panel scroll so lower accordion headers remain reachable when all detail sections are open.

## Guardrails
- No sample JSON files modified.
- No roadmap files modified.
- No cross-tool communication added.
- No normalized session storage object shape changes.

## Validation
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` passed.
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "shows normalized workspace tool sessions as JSON, Data, and Dirty views"` passed.
- `npm run test:workspace-v2` passed: 15 tests.

## Full Samples Smoke
- Skipped per PR instructions. This PR is limited to Session Inspector V2 output layout and targeted Workspace Manager V2 Playwright coverage.
