# Playwright Session Inspector V2 State View

## Command
`npm run test:workspace-v2`

## Result
- Passed: 15/15
- Runtime: about 1.3 minutes

## Targeted Coverage
- Session Inspector V2 has no Schema section/control label.
- State section/control is present.
- JSON shows the selected storage entry's full stored object.
- State shows only the selected normalized tool object's `state` section.
- State shows an actionable empty-state message when no `state` section exists.
- JSON and State accordions open and close predictably.
- Controls, Filters, Entries, and Status accordions continue to open and close.
- Workspace Manager V2 hydration remains normalized to `workspace.tools.<tool-id>`.
- Old split `.schema` and `.state` per-tool keys are not recreated.

## Skipped
- Full samples smoke test was skipped by request. The changed behavior is covered by `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
