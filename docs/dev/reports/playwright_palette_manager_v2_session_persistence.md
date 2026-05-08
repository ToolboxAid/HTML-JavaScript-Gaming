# Playwright Palette Manager V2 Session Persistence

## Commands
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "exports manifests and launches tools from fixed Workspace Manager V2 tiles"`
- `npm run test:workspace-v2`

## Results
- Focused launch persistence test: passed 1/1.
- Workspace Manager V2 suite: passed 16/16.

## Targeted Coverage
- Verified Palette Manager V2 launches from Workspace Manager V2 and loads the Asteroids palette from `workspace.tools.palette-manager-v2.data`.
- Verified a palette edit updates `workspace.tools.palette-manager-v2.data.swatches`.
- Verified the same edit marks `dirty.isDirty` true with `reason: "palette-updated"`, an ISO `changedAt`, and palette `changedKeys`.
- Verified returning to Workspace Manager V2 preserves the edited session data instead of overwriting it with manifest defaults.
- Verified reopening Palette Manager V2 shows the unsaved edited swatch from session storage.
- Verified Preview Generator V2 still launches and generates after the Palette Manager V2 persistence flow.
- Verified Session Inspector V2 Delete All behavior still clears displayed session entries through the Workspace Manager V2 suite.

## Skipped
- Full samples smoke test was skipped by request. The relevant session persistence, Workspace Manager V2 return, Palette Manager V2 reopen, Preview Generator V2 launch, and Session Inspector V2 reset paths are covered by `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
