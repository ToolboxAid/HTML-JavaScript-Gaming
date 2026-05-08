# PR_26128_010 Workspace Session Hydration

## Summary
Workspace Manager V2 now hydrates session storage only after explicit user progress through repo selection and valid game selection.

## Runtime Changes
- Initial Workspace Manager V2 load clears stale `workspace.repo.reference` and `workspace.tools.*` hydration unless the page is explicitly returning with `hostContextId`.
- Repo selection stores a serializable repo reference at `workspace.repo.reference` after repo discovery succeeds.
- Repo load failure clears/disables Active Game and leaves no repo/tool hydration.
- Valid game selection hydrates each enabled launchable tool with stable keys:
  - `workspace.tools.<tool-id>.schema`
  - `workspace.tools.<tool-id>.state`
- Tool tiles and export stay disabled unless session hydration succeeds.
- Game selection changes clear prior per-tool hydration before building the next context.

## Hydrated Tools
- `templates-v2`
- `asset-manager-v2`
- `palette-manager-v2`
- `preview-generator-v2`

## Boundary Notes
- No cross-tool direct communication was added.
- No repo write behavior was changed.
- No sample JSON or roadmap content was modified.
- Runtime behavior still ignores `game.workspace`; only Workspace Manager V2 reads it to build editor/tool context.
- The repo value in session storage is a serializable reference, not a live `FileSystemDirectoryHandle`; live handle access remains user-selected in the active page.

## Validation
- `npm run test:workspace-v2`: PASS, 12 tests passed.
- Schema verification report: PASS.
- Initial load has no active game session hydration: PASS.
- Repo reference appears only after successful repo selection/discovery: PASS.
- Tool session keys appear only after valid game selection/open: PASS.
- Tools remain disabled until valid game selection and session hydration: PASS.
- Tools enable after session hydration succeeds: PASS.
- Default Asteroids selection did not return: PASS.

## Skipped
Full samples smoke test was skipped as requested. This PR is scoped to Workspace Manager V2 session hydration and schema/reference verification; the targeted Workspace Manager V2 suite covers the affected repo selection, Active Game gating, launch, Preview Generator V2, Palette Manager V2, Asset Manager V2, and UAT paths.
