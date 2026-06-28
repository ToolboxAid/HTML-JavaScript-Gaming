# PR_26180_OWNER_008-move-www-application Report

## Executive Summary

PASS. This PR moves the tracked browser-served application surface into `www/` while preserving the public URL contract.

The move uses the PR007 route-root compatibility helper. Local static serving now prefers `www/` by default, and repository-root fallback remains available for transition-only compatibility such as root `src/` imports.

## Scope

- Moved root browser-served files and folders into `www/`.
- Preserved public URLs such as `/index.html`, `/toolbox/index.html`, `/assets/...`, `/account/...`, `/admin/...`, and `/games/...`.
- Did not move API/server application code into `api/`.
- Did not move dev-only tooling into `dev/local-runtime/`.
- Did not change package commands.
- Did not add feature work or product behavior changes.

## Browser-Served Routes Moved

- `index.html` -> `www/index.html`
- `account/` -> `www/account/`
- `admin/` -> `www/admin/`
- `assets/` -> `www/assets/`
- `community/` -> `www/community/`
- `company/` -> `www/company/`
- `docs/` -> `www/docs/`
- `games/` -> `www/games/`
- `learn/` -> `www/learn/`
- `legal/` -> `www/legal/`
- `marketplace/` -> `www/marketplace/`
- `memberships/` -> `www/memberships/`
- `owner/` -> `www/owner/`
- `toolbox/` -> `www/toolbox/`

No tracked root `play/` folder existed.

## Implementation Notes

- `DEFAULT_LOCAL_WEB_ROOT` now points to `www`.
- `GAMEFOUNDRY_LOCAL_WEB_ROOT=www` remains the explicit local web-root setting.
- `GAMEFOUNDRY_LOCAL_WEB_ROOT=repo-root` remains available for transition validation.
- Node-side imports and validation scripts that read moved browser assets/toolbox files were updated to use `www/...` filesystem paths.
- Browser-visible route strings were preserved.
- `dev/build/ProjectInstructions` docs and backlog status were updated for PR008.

## Staged Delta Summary

- Changed files: 515
- Renames/moves: 482
- Modified files: 32
- Deleted placeholder: 1 (`www/.gitkeep`)

## Notes

The root `assets/` folder may still physically exist in this local checkout because of an ignored local file (`assets/DemoGame-26168-001.gfsp`). No tracked browser files remain under the old root browser route folders.

## Owner Recommendation

Ready for review as the `www/` application move step in the repository architecture simplification stack.
