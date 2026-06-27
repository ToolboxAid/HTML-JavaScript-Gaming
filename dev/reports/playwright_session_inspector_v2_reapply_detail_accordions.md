# Playwright Session Inspector V2 Reapply Detail Accordions

## Command
`npm run test:workspace-v2`

## Result
- Passed: 15/15
- Runtime: about 1.5 minutes

## Targeted Coverage
- Verified JSON accordion opens and closes correctly.
- Verified Data accordion opens and closes correctly.
- Verified Dirty accordion opens and closes correctly.
- Verified Status accordion opens and closes correctly.
- Verified JSON, Data, Dirty, and Status do not fight each other:
  - closing one leaves the other three open
  - reopening one leaves the other three open
- Verified Copy All still copies a single labeled JSON/Data/Dirty payload.
- Verified Clear Status still clears the Session Inspector V2 status log.
- Verified existing storage tile layout and delete behavior still pass.

## Skipped
- Full samples smoke test was skipped by request. The relevant Session Inspector V2 accordion, Copy All, Clear Status, and Workspace Manager V2 launch coverage is in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
