# PLAN_PR_11_313

## Purpose
Rename `legacy asset browser v2 id` to `asset-manager-v2` as a single repo-wide contract with no aliasing or compatibility layer.

## Scope
- Tool folder/path names
- Tool/session IDs and launch links
- Workspace V2 payload/session wiring
- Fixtures, samples/tests/docs references
- Tool index/menu/registry labels and links
- PR/report docs that reference the old contract ID

## Steps
1. Rename file/folder paths containing `legacy asset browser v2 id` to `asset-manager-v2`.
2. Replace all content references from `legacy asset browser v2 id` to `asset-manager-v2`.
3. Keep payload structure unchanged; preserve strict `payloadJson.assetCatalog` validation behavior.
4. Ensure Workspace V2 launches `asset-manager-v2` with active session payload.
5. Run repo-wide audit proving zero old-ID references.
6. Run `node --check` on all changed JS/MJS files and targeted Workspace V2 launch test.
7. Record evidence and package PR delta zip.
