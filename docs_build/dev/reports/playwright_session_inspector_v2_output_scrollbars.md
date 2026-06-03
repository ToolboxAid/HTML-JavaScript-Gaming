# Playwright Session Inspector V2 Output Scrollbars

## Command
`npm run test:workspace-v2`

## Result
- Passed: 15/15
- Runtime: about 1.5 minutes

## Targeted Coverage
- Verified `#sessionInspectorV2JsonOutput` scrolls vertically and horizontally with long JSON content.
- Verified `#sessionInspectorV2DataOutput` scrolls vertically and horizontally with long Data content.
- Verified `#sessionInspectorV2DirtyOutput` scrolls vertically and horizontally when Dirty content overflows.
- Verified JSON/Data/Dirty accordion content wrappers do not own the primary scrollbars.
- Verified JSON/Data/Dirty output heights remain bounded.
- Verified Dirty and Status headers remain visible/reachable.
- Verified Copy All still copies the JSON/Data/Dirty payload.
- Verified Dirty header values remain covered for false, true, and unknown states.

## Skipped
- Full samples smoke test was skipped by request. The relevant output scrollbar, detail panel, Dirty header, and Copy All coverage is in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
