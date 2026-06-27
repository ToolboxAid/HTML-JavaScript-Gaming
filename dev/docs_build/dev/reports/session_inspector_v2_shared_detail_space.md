# PR_26128_026 Session Inspector V2 Shared Detail Space

## Scope
- Updated Session Inspector V2 right-side detail layout.
- Updated Copy All payload formatting for selected storage entries.
- Preserved normalized session object shape, Dirty header values, and Clear Status behavior.

## Changes
- JSON, Data, Dirty, and Status now share the right detail panel through flex layout.
- Open detail sections split available vertical space evenly.
- Closed detail sections keep only their headers visible.
- JSON/Data/Dirty/Status outputs keep vertical scrolling inside the output element.
- JSON/Data/Dirty/Status outputs wrap long lines and suppress horizontal scrolling.
- Copy All now includes `Session: <storageType>:<key>` before each JSON, Data, and Dirty block.

## Guardrails
- No sample JSON files modified.
- No roadmap files modified.
- No cross-tool communication added.
- No schema or normalized session object shape changes.

## Validation
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` passed.
- Focused Session Inspector V2 launch/copy test passed.
- Focused normalized JSON/Data/Dirty shared-space test passed.
- `npm run test:workspace-v2` passed: 15 tests.

## Full Samples Smoke
- Skipped per PR instructions. This PR is limited to Session Inspector V2 detail-panel layout and Copy All text formatting; targeted Workspace Manager V2 Playwright coverage validates the affected launch and inspector flows.
