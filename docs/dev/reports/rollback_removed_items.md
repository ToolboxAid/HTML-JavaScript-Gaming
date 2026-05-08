# PR_26128_001 Rollback Removed Items

## Removed Runtime Rewrites
- Removed the uncommitted Workspace Manager V2 repo scan/select rewrite that added `selectRepoButton`, `activeRepoSummary`, `selectRepoRoot`, repo handle persistence, and `/__repo/games` coupling.
- Removed the uncommitted Preview Generator V2 node write mode rewrite that added `/__preview-generator-v2/write-preview`, `/__repo/status`, persisted repo handle restore, and node endpoint write selection.
- Removed the uncommitted shared `tools/common/RepoHandleStore.js` coupling and `tools/preview-generator-v2/PreviewGeneratorV2RepoHandleStore.js` wrapper.
- Removed the uncommitted `scripts/workspace-v2-dev-server.mjs` dev server and the related `package.json` `dev-tools` / `dev:workspace-v2` script additions.
- Removed the uncommitted storage debug page replacement under `tests/index.html`, `tests/storage-debug.css`, and `tests/storage-debug.js`.
- Removed the uncommitted Workspace V2 test rewrites that depended on node-backed repo selection, storage debug persistence, and persisted browser directory handles.

## Restored Baseline Behavior
- Workspace Manager V2 now uses the committed static game list and sessionStorage-based workspace context flow.
- Preview Generator V2 workspace launch uses the committed session-context repoPath hydration path and no longer depends on the removed node dev-tools server.
- Preview Generator V2 tools-mode repo picking remains scoped to Preview Generator V2 and is not shared through IndexedDB or Workspace Manager V2 auto-wiring.
