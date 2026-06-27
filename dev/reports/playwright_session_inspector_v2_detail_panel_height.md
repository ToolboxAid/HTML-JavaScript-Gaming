# Playwright Session Inspector V2 Detail Panel Height

## Command
`npm run test:workspace-v2`

## Result
- Passed: 15/15
- Runtime: about 1.5 minutes

## Targeted Coverage
- Verified JSON content scrolls inside `#sessionInspectorV2JsonContent` for a long selected object.
- Verified Data content scrolls inside `#sessionInspectorV2DataContent` for a long selected data payload.
- Verified JSON and Data panel heights remain bounded.
- Verified Dirty and Status headers remain visible/reachable with long JSON/Data content.
- Verified Dirty header shows `Dirty: false` for clean selected items.
- Verified Dirty header shows `Dirty: true` for dirty selected items.
- Verified Dirty header shows `Dirty: unknown` when dirty data is missing.
- Verified Copy All still copies JSON/Data/Dirty content.
- Verified Clear Status still clears Session Inspector V2 status output.
- Verified existing JSON/Data/Dirty/Status accordion independence remains covered.

## Skipped
- Full samples smoke test was skipped by request. The relevant Session Inspector V2 layout, accordion, Copy All, Clear Status, and dirty-header behavior is covered by `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
