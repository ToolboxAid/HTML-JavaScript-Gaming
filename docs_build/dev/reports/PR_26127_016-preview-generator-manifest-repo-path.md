# PR_26127_016-preview-generator-manifest-repo-path

## Summary
- Added optional `repoPath` support to `toolbox/schemas/workspace.manifest.schema.json`.
- Added `repoPath` to `games/Asteroids/game.manifest.json` as the absolute filesystem repo path for direct preview writes.
- Kept `repoRoot` as the display label.
- Workspace Manager V2 now reads `repoPath`, surfaces `Select Repo` when it is missing, and passes manifest/session context through to launched tools.
- Preview Generator V2 now hides `Pick Repo Folder` during Workspace Manager launches and uses manifest `repoPath` for direct writes.

## Manifest Repo Path Notes
- `repoPath` is optional in the schema so existing manifests without it can still validate.
- When `repoPath` is present and absolute, Preview Generator V2 enables Generate Preview after preview target validation.
- When `repoPath` is missing or invalid, Preview Generator V2 opens, logs an actionable status message, and keeps Generate Preview disabled.
- `/__workspace-manager-v2/repo-root` is not called or restored.

## Preview Generator Notes
- Workspace launch logs now distinguish:
  - workspace launch hydrated
  - `repoRoot` display label available
  - `repoPath` available or missing
  - resolved absolute preview output path
  - direct write success/failure
- Asteroids Workspace Manager launch writes generated preview output to `games/Asteroids/assets/images/preview.svg` using `repoPath`.

## Workspace Manager Notes
- Preview Generator V2 tile shows `Schema-valid manifest` when `repoPath` is available.
- Preview Generator V2 tile shows `Select Repo` when `repoPath` is missing.
- Asset Manager V2 workspace context validation accepts the new root-level `repoPath` manifest field.

## Validation
- `npm run test:workspace-v2`
- Result: PASS, 10 tests passed.
- Validated manifest `repoPath`, Preview Generator workspace launch with direct write enabled, missing `repoPath` disabled/actionable state, hidden Pick Repo Folder, and no `/__workspace-manager-v2/repo-root` dependency.

## Out Of Scope
- Deprecated `toolbox/workspace-v2` was not modified.
- Sample JSON was not modified.
- Full samples smoke test was skipped because this PR is manifest repo path and Preview Generator launch scoped.
