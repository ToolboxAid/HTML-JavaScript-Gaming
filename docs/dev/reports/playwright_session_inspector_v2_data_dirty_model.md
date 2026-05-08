# Playwright Session Inspector V2 Data Dirty Model

## Command
`npm run test:workspace-v2`

## Result
- Passed: 15/15
- Runtime: about 1.4 minutes

## Targeted Coverage
- Workspace Manager V2 writes normalized tool sessions with `schema`, `workspace`, `data`, and `dirty`.
- Repeated workspace/repo/game context lives under `workspace`.
- Actual tool payload lives under `data`.
- Dirty tracking defaults to the clean object.
- Session Inspector V2 shows JSON, Data, and Dirty views.
- Session Inspector V2 State and Schema labels/controls are absent.
- JSON shows the full selected object.
- Data shows only selected `data`.
- Dirty shows only selected `dirty`.
- JSON, Data, Dirty, Controls, Filters, Entries, and Status accordions all open and close.
- Split `workspace.tools.<tool-id>.schema` and `workspace.tools.<tool-id>.state` keys are not recreated.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is covered by `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
