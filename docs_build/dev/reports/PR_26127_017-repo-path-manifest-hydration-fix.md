# PR_26127_017-repo-path-manifest-hydration-fix

## Summary
- Added forward-slash absolute `repoPath` values to Workspace Manager V2 UAT, Asteroids, Pong, and Gravity Well manifests.
- Kept `repoRoot` as the display-only repo label.
- Preserved optional `repoPath` support in `tools/schemas/workspace.manifest.schema.json`.
- Preview Generator V2 continues to use `repoPath` as the workspace launch direct-write root.
- Preview Generator V2 keeps `Pick Repo Folder` hidden when launched from Workspace Manager V2.

## Manifest Hydration Notes
- `repoPath` uses `C:/Users/davidq/Documents/GitHub/HTML-JavaScript-Gaming`.
- `repoPath` is passed through the Workspace Manager V2 manifest/session launch context.
- Asteroids, Pong, and Gravity Well Preview Generator V2 launches hydrate with:
  - absolute `repoPath`
  - visible target source limited to games
  - manifest preview source
  - generated preview target
  - enabled Generate Preview

## Direct Write Notes
- Preview Generator V2 combines `repoPath` with the generated preview target for workspace direct writes.
- Missing `repoPath` is still covered as an actionable disabled state.
- `/__workspace-manager-v2/repo-root` is not called.

## Validation
- `npm run test:workspace-v2`
- Result: PASS, 10 tests passed.
- Validated Asteroids direct write to generated preview target and Asteroids/Pong/Gravity Well launch hydration enabling Generate Preview.

## Out Of Scope
- Deprecated `tools/workspace-v2` was not modified.
- Sample JSON was not modified.
- Full samples smoke test was skipped because this PR is repoPath hydration scoped.
