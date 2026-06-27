# PR_26170_012-friendly-routes-folders Report

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Command: `git branch --show-current`

## Requirement Checklist

PASS - Rename safe routes/folders only after impact documentation.

- Safe route/folder renamed:
  - `toolbox/users/index.html` page content moved to `toolbox/game-crew/index.html`.
- Compatibility route retained:
  - `toolbox/users/index.html` now renders a visible route-moved page with a normal link to `/toolbox/game-crew/index.html`.
- Route impact decision:
  - The `users` tool key remains unchanged because it is a registry/database contract.

PASS - Update all safe references.

- `src/shared/toolbox/tool-metadata-inventory.js` now sets the `users` tool entry route fields to:
  - `path: "game-crew"`
  - `folderName: "game-crew"`
  - `entryPoint: "game-crew/index.html"`
- `src/dev-runtime/server/local-api-router.mjs` now syncs `path` for source-controlled toolbox tools, so stale DB-backed metadata rows do not keep the old `toolbox/users/index.html` route.
- `tests/playwright/tools/ToolboxRoutePages.spec.mjs` validates the new Toolbox card route and old-route compatibility.

PASS - Add compatibility/redirect notes where needed.

- The old `toolbox/users/index.html` route remains available and visibly states that Game Crew moved.
- The compatibility page links creators to `/toolbox/game-crew/index.html`.
- No inline JavaScript, inline CSS, or inline event handlers were introduced.

PASS - Do not move Game Journey unless explicitly required.

- Game Journey route/folder remains unchanged.

PASS - Do not rename unsafe routes/folders.

- `toolbox/game-workspace/` was not renamed because it is tied to active tool keys, repository ids, API paths, tests, and runtime contracts.
- Admin routes such as `admin/users.html`, `admin/roles.html`, and `admin/invitations.html` were not renamed because they are service/table-backed admin routes.

PASS - Preserve runtime behavior.

- Planned-tool launch blocking remains unchanged for Game Crew.
- The Toolbox card exposes the friendly route in `href` and `data-registered-tool-route`, while `data-toolbox-launch-blocked="planned"` still prevents planned runtime launch.
- Direct navigation to `/toolbox/game-crew/index.html` resolves correctly.
- Old route `/toolbox/users/index.html` resolves to a compatibility page with a link to the new route.

## Root Cause And Fix

The first targeted Playwright run showed the Game Crew card still rendered `/toolbox/users/index.html`.

Root cause:

- Shared source metadata had been updated to `game-crew/index.html`, but DB-backed Toolbox metadata rows were source-synced only for display fields, not `path`.

Fix:

- Added `path` to `SOURCE_CONTROLLED_TOOLBOX_METADATA_FIELDS` in `src/dev-runtime/server/local-api-router.mjs` so the DB-backed metadata contract follows the shared route SSoT for source-controlled tools.

## Validation Lane Report

Impacted lane: targeted Toolbox route/link and metadata rendering.

Commands run:

```powershell
node --check src/shared/toolbox/tool-metadata-inventory.js
node --check src/dev-runtime/server/local-api-router.mjs
node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs
Test-Path -LiteralPath toolbox\game-crew\index.html
Test-Path -LiteralPath toolbox\users\index.html
rg -n 'game-crew' src/shared/toolbox/tool-metadata-inventory.js toolbox/users/index.html docs_build/pr/BUILD_PR_26170_012-friendly-routes-folders.md
rg -n 'toolbox/users/index\.html|users/index\.html' toolbox assets src/shared tests/playwright/tools
rg -n 'toolbox/game-crew/index\.html|game-crew/index\.html|\"path\": \"game-crew\"|\"folderName\": \"game-crew\"' toolbox assets src/shared tests/playwright/tools
git diff --check -- src/shared/toolbox/tool-metadata-inventory.js src/dev-runtime/server/local-api-router.mjs tests/playwright/tools/ToolboxRoutePages.spec.mjs toolbox/game-crew/index.html toolbox/users/index.html docs_build/pr/BUILD_PR_26170_012-friendly-routes-folders.md
```

Results:

- PASS - all `node --check` commands completed successfully.
- PASS - friendly route and compatibility route files exist.
- PASS - shared metadata route fields point at `game-crew/index.html`.
- PASS - active old-route references are limited to the compatibility test path.
- PASS - `git diff --check` completed successfully.

HTML guard:

```powershell
rg --pcre2 -n '<script(?![^>]+src=)|<style\b|\sstyle=|\son[a-z]+\s*=' -- toolbox/game-crew/index.html toolbox/users/index.html
```

Result:

- PASS - no prohibited inline HTML styling/scripting was found.

## Playwright Result

PASS

Command:

```powershell
npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --grep "toolbox grouped view|Game Crew friendly route" --workers=1 --reporter=list
```

Result:

- `2 passed`

Behavior validated:

- Toolbox grouped rendering still uses the requested workflow order.
- Game Crew card route is `/toolbox/game-crew/index.html`.
- Game Crew remains planned and launch-blocked by existing planned-tool behavior.
- Direct friendly route resolves.
- Old `toolbox/users/index.html` compatibility route renders and links to the friendly route.

Coverage note:

- `toolbox/tools-page-accordions.js` was collected in V8 coverage.
- `src/shared/toolbox/tool-metadata-inventory.js` and `src/dev-runtime/server/local-api-router.mjs` are advisory WARN in coverage because they are server/static metadata paths; syntax and Playwright route behavior validated their impact.

## Manual Validation Notes

- Verified `toolbox/game-crew/index.html` uses the existing Game Crew page content and keeps `data-tool-slug="users"` as the stable tool key contract.
- Verified `toolbox/users/index.html` is a compatibility page, not a second competing Game Crew implementation.
- Verified Game Hub, Admin Creators, Admin Responsibilities, Admin Invites, and Game Journey routes were not renamed.

## Skipped Lanes

- Full samples: SKIP - samples are not in scope.
- Broad Admin/Owner navigation: SKIP - no Admin/Owner route behavior changed.
- Game Hub route tests: SKIP - Game Hub route rename was explicitly classified unsafe for this PR.
- Full Toolbox suite: SKIP - targeted grouped-route and Game Crew compatibility coverage was sufficient for this scoped route change.

## Samples Decision

SKIP - no sample files or sample runtime behavior changed.

## Artifacts

- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26170_012-friendly-routes-folders_delta.zip`

Packaging note:

- Unrelated untracked local files `docs_build/dev/admin-notes/GFS-AI-Credits-Reseller-Strategy.pdf` and `docs_build/dev/admin-notes/engine/GameLoop.txt` were observed in `git status` and excluded from the PR012 ZIP.
