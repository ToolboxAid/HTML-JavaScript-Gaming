# Playwright Session Inspector V2 Normalized Tool Keys

## Command
`npm run test:workspace-v2`

## Result
- Passed: 15/15
- Runtime: about 1.3 minutes

## Targeted Coverage
- Workspace Manager V2 hydrates one session key per tool:
  - `workspace.tools.templates-v2`
  - `workspace.tools.asset-manager-v2`
  - `workspace.tools.palette-manager-v2`
  - `workspace.tools.preview-generator-v2`
  - `workspace.tools.session-inspector-v2`
- Workspace Manager V2 does not create old split `.schema` or `.state` per-tool keys.
- Session Inspector V2 shows normalized tool session values as one tile per tool.
- JSON section shows the full combined object.
- Schema section shows only schema data.
- Schema section shows a visible empty-state message when the selected entry has no schema.
- Per-tile Delete removes the normalized key.
- Delete All still clears displayed entries.
- Preview Generator V2 reads repo/game context from the normalized session key and remains able to generate a preview.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is covered by targeted Workspace Manager V2, Session Inspector V2, and Preview Generator V2 workspace-launch validation in `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
