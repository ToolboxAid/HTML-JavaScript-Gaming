# Playwright Workspace Hydrate Game Tools Only

## Command
`npm run test:workspace-v2`

## Result
- Passed: 15/15
- Runtime: about 1.4 minutes

## Targeted Coverage
- Verified initial Workspace Manager V2 load still has no hydrated tool sessions.
- Verified selecting Asteroids hydrates:
  - `workspace.tools.asset-manager-v2`
  - `workspace.tools.palette-manager-v2`
  - `workspace.tools.preview-generator-v2`
  - `workspace.tools.session-inspector-v2`
- Verified selecting Asteroids does not hydrate `workspace.tools.templates-v2`.
- Verified the hydration report lists hydrated tools and skipped tools with skip reasons.
- Verified the `templates-v2` tile is disabled after Asteroids opens because it is not enabled for the selected game.
- Verified Asset Manager V2 and Palette Manager V2 retain manifest-backed data hydration.
- Verified dirty defaults remain clean for hydrated tools.
- Verified Session Inspector V2 does not show an unrelated `workspace.tools.templates-v2` entry after selecting Asteroids.
- Verified Preview Generator V2 still opens from Workspace Manager V2 and reaches enabled image generation state.
- Verified imported Asteroids game manifests also skip `workspace.tools.templates-v2`.

## Skipped
- Full samples smoke test was skipped by request. The relevant hydration, launch, Session Inspector V2, and Preview Generator V2 paths are covered by `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
