# PR_26127_018-preview-repopath-debug-and-enable-fix

## Summary
- Preview Generator V2 now logs raw Workspace Manager V2 launch path fields during workspace launch hydration.
- Repo path resolution now considers the actual launch payload and nested manifest object before falling back to display-only fields.
- Generate Preview remains enabled when the resolved repoPath is absolute and the manifest preview target is valid.

## RepoPath Debug Notes
- Status logs now include:
  - `launchContext.repoPath`
  - `launchContext.manifest.repoPath`
  - `launchContext.repoRoot`
  - `manifest.repoPath`
  - `manifest.repoRoot`
- Status logs now include the selected repoPath source field, resolved value, and absolute-path decision.
- If repoPath is missing, Status logs the exact repoPath fields checked and missing.
- No `/__workspace-manager-v2/repo-root` lookup is used.

## Hydration Notes
- Workspace launch context accepts either the manifest directly or a payload containing `manifest`.
- Absolute repoPath values from the launch payload/manifest are used for direct preview write path resolution.
- Display-only repoRoot still allows Preview Generator V2 to open, but keeps Generate Preview disabled until an absolute repoPath is available.
- Pick Repo Folder stays hidden for Workspace Manager V2 launches.

## Validation
- `npm run test:workspace-v2`
- Result: Pass, 10 tests passed.

## Manual Validation
1. Open Workspace Manager V2 and load Asteroids.
2. Launch Preview Generator V2 from the Preview Generator V2 tile.
3. Confirm Status shows all raw repoPath/repoRoot fields and the resolved repoPath decision.
4. Confirm Repo selected shows the absolute repoPath and Pick Repo Folder is hidden.
5. Confirm Generate Image is enabled when repoPath is absolute and preview target is valid.
6. Confirm Status does not mention `/__workspace-manager-v2/repo-root`.
