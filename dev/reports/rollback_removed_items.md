# PR_26128_003 Rollback Removed Items

## Removed Runtime Rewrites
- Removed Preview Generator V2 workspace absolute `repoPath` hydration used for direct preview writes.
- Removed Preview Generator V2 `/__workspace-manager-v2/write-preview` fetch calls and `X-Workspace-Preview-*` headers.
- Removed Preview Generator V2 direct-write validation, absolute path resolution, direct-write logging, and direct-write fallback handling.
- Removed Workspace Manager V2 summary copy that asked users to select a repo before direct preview writes.
- Removed Workspace Manager V2 preview tile `repoPathReady` gating and the `Select Repo` preview tile status.
- Removed the Playwright repo server's private preview-write endpoint and preview write capture maps.

## Restored Baseline Behavior
- Workspace Manager V2 launches Preview Generator V2 with display-only workspace context.
- Preview Generator V2 workspace launches hydrate the selected game, asset folder, preview target, and preview image without writing files.
- Preview Generator V2 preview writes require the normal Preview Generator repo folder selection path.
- Workspace Manager V2 no longer exposes runtime coupling for Preview Generator V2 writes.
