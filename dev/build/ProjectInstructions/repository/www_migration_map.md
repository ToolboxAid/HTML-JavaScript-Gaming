# www Migration Map

Status: Implemented migration map
Owner: Owner
Workstream: Repository Architecture Simplification
PR: PR_26180_OWNER_006-www-migration-map; PR_26180_OWNER_008-move-www-application

## Purpose

Document the current browser-served repository surface and the safe sequence required before moving files into `www/`.

This map began as a no-runtime-change governance artifact. `PR_26180_OWNER_008-move-www-application` used it to move browser-served files under `www/` while preserving public URLs.

## Executive Summary

The browser-served application now lives under `www/`.

Current local runtime, test helpers, and browser pages keep URLs such as `/index.html`, `/toolbox/index.html`, `/assets/theme-v2/css/theme.css`, `/account/sign-in.html`, `/admin/system-health.html`, and `/games/index.html` while resolving browser-served files from `www/`.

The move preserved public route URLs while changing the filesystem lookup root. Repository-root fallback remains available for transition-only compatibility, including browser imports that still reference root-level `src/`.

## Current Browser-Served Surface

Current browser-served entry points and folders now live under `www/`:

| Path | Current role | Files | HTML files | Move target |
| --- | --- | ---: | ---: | --- |
| `index.html` | Root marketing/product entry | 1 | 1 | `www/index.html` |
| `account/` | Account pages | 13 | 11 | `www/account/` |
| `admin/` | Admin/Owner pages | 18 | 16 | `www/admin/` |
| `assets/` | Browser assets, Theme V2, tool assets, partials | 328 | 5 | `www/assets/` |
| `community/` | Community/public pages | 3 | 3 | `www/community/` |
| `company/` | Company/public pages | 7 | 7 | `www/company/` |
| `docs/` | Production Docs & Help pages | 5 | 4 | `www/docs/` only when route preservation is ready |
| `games/` | Public game discovery pages | 12 | 8 | `www/games/` |
| `learn/` | Learning pages | 11 | 11 | `www/learn/` |
| `legal/` | Legal pages | 17 | 9 | `www/legal/` |
| `marketplace/` | Marketplace page | 1 | 1 | `www/marketplace/` |
| `memberships/` | Membership page | 1 | 1 | `www/memberships/` |
| `owner/` | Owner governance/admin pages | 8 | 8 | `www/owner/` |
| `toolbox/` | Creator toolbox pages and legacy sidecars | 57 | 49 | `www/toolbox/` |

No top-level `play/` folder exists in the current tracked repository root. Any existing `play/` string references must be reviewed as route/content references before a future move introduces or preserves a `play/` route.

## Current Reference Inventory

Broad active-reference search across browser roots, `src/`, `dev/scripts/`, and `dev/tests/` found:

| Reference | Approximate active files | Notes |
| --- | ---: | --- |
| `assets/` | 230 | Theme CSS/JS, images, tool JS, workers, partials, and test fixtures. |
| `toolbox/` | 241 | Tool routes, registry routes, tests, validation scripts, and server route compatibility. |
| `account/` | 43 | Account routes, return URLs, and Playwright coverage. |
| `legal/` | 13 | Footer/navigation route references and page links. |
| `learn/` | 9 | Learn route links and navigation. |
| `play/` | 7 | No root folder exists; review references manually before introducing a route. |
| `src/` | 451 | Browser imports, server imports, tests, validation aliases, and current runtime/source modules. |

The high `src/` count means the browser migration cannot be treated as static files only. Several browser-facing pages import modules from root-level `src/`, including account/admin/toolbox flows.

## Examples Of References That Must Be Preserved Or Rewritten

### Preserve public route URLs

These URLs should continue working for users and tests during the move:

- `/index.html`
- `/toolbox/index.html`
- `/toolbox/{tool}/index.html`
- `/account/{page}.html`
- `/admin/{page}.html`
- `/games/index.html`
- `/learn/index.html`
- `/legal/index.html`
- `/marketplace/index.html`
- `/memberships/index.html`

### Rewritten filesystem lookup paths

Static servers and test helpers should map public URLs to `www/` filesystem paths after the move:

- `/index.html` -> `www/index.html`
- `/toolbox/index.html` -> `www/toolbox/index.html`
- `/assets/theme-v2/css/theme.css` -> `www/assets/theme-v2/css/theme.css`

### Preserve service/API route behavior

API routes must remain API routes and must not be resolved as static browser files:

- `/api/*`
- `/api/toolbox/*`
- `/api/session/*`
- `/api/auth/*`

### Browser import references needing migration review

Examples of current references that depend on root-level path relationships:

- `account/user-controls-page.js` imports from `../src/api/` and `../src/engine/`.
- `admin/tool-votes.js` imports from `../src/api/` and `../toolbox/tool-registry-api-client.js`.
- `admin/db-viewer.js` imports from `../src/api/`.
- `owner/notes.html` loads `../src/dev-runtime/admin/admin-notes-viewer.js`.
- `toolbox/toolRegistry.js` imports from `../src/shared/toolbox/tool-metadata-inventory.js`.
- `assets/toolbox/*/js/index.js` imports from `../../../../src/` or `../../../../toolbox/` in several tool flows.

These references can be preserved temporarily by serving compatibility paths from the repository root, but the final architecture should move browser-facing runtime modules into `www/` or an approved deployable browser module surface.

## Current Local Web Server Root Behavior

Three active server/helper surfaces currently resolve static browser paths through the shared static route resolver:

| File | Current behavior |
| --- | --- |
| `dev/scripts/start-dev.mjs` | Team-aware bootstrap static server resolves requests with `resolveStaticRouteTarget()`, preferring `www/` while preserving public route URLs and compatibility routes. |
| `api/server/local-api-server.mjs` | Legacy local API alias serves API routes and falls back to `resolveStaticRouteTarget()`, preferring `www/` while preserving public route URLs and compatibility routes. |
| `dev/tests/helpers/playwrightRepoServer.mjs` | Playwright test server mirrors the shared static route resolver and compatibility routes. |

The actual `www/` move introduced the shared route resolver so public URLs continue to resolve while filesystem ownership lives under `www/`.

## Current Test Assumptions

At the time of the migration map, Playwright and runtime tests assumed root-based public routes and root-relative filesystem paths:

- 96 Playwright/helper/runtime files reference public routes such as `/toolbox`, `/account`, `/admin`, `/games`, `/learn`, `/legal`, `/marketplace`, `/memberships`, or `/index.html`.
- `dev/tests/playwright/tools/ToolNavigationPrevNext.spec.mjs` opens `/toolbox/index.html` and `/toolbox/game-design/index.html`.
- `dev/tests/playwright/tools/BuildPathProgressSimplification.spec.mjs` opens `/index.html`, `/toolbox/index.html`, and `/admin/tool-votes.html`.
- `dev/tests/playwright/tools/EnvironmentBannerCoverage.spec.mjs` covers root/home, marketplace, learn, and memberships route families.
- `dev/tests/runtime/V2*` tests frequently assert `toolbox/{tool}/index.html` filesystem or URL behavior.
- `dev/scripts/run-node-tests.mjs` and `dev/scripts/run-node-test-files.mjs` register root aliases for `/src/` and `/toolbox/`.

The `www/` move PR updated test helpers and route expectations for the filesystem root change. Browser-visible URLs must remain stable unless Owner explicitly approves a public URL change.

## Preserve Versus Rewrite

### Preserve

- Public browser URLs.
- `/tools/*` compatibility routing to toolbox pages until Owner approves route removal.
- `/api/*` service contract routes.
- Theme V2 asset URLs as browser routes, even if filesystem paths move under `www/`.
- Tool route semantics and Product Owner test flows.
- Existing package commands until the PR explicitly scoped to command migration.

### Rewrite

- Filesystem path resolution in local static servers and Playwright test helpers.
- Internal static file lookup roots from repository root to `www/`.
- Relative links/imports that break because source and target files move together.
- Validation scripts that inspect browser-served file locations.
- Coverage mapping that classifies `toolbox/`, `assets/theme-v2/js/`, and browser routes after the move.

### Defer

- Moving developer bootstrap into `dev/local-runtime/`.
- Removing legacy root compatibility routes.
- Changing package commands.
- Renaming public URLs.

## Compatibility Redirects Or Shims

Temporary compatibility is likely required.

Recommended approach for the actual move PR:

1. Preserve public URLs while changing filesystem roots.
2. Add a shared route resolution helper or equivalent route table for local runtime/test servers.
3. Keep `/tools/*` -> `/toolbox/*` compatibility.
4. Keep root URL families stable: `/account`, `/admin`, `/assets`, `/games`, `/learn`, `/legal`, `/marketplace`, `/memberships`, `/owner`, `/toolbox`.
5. Do not introduce browser redirects unless a static route cannot be served directly.
6. Document every temporary shim with removal criteria for the legacy-layout cleanup PR.

## Route Root Compatibility Toggle

`PR_26180_OWNER_007-www-route-root-compatibility` installed the local compatibility switch without moving browser files.

`PR_26180_OWNER_008-move-www-application` moves browser-served files into `www/` and makes local static serving prefer `www/` by default.

The local static serving root is now `www/` by default. The explicit activation toggle remains:

```text
GAMEFOUNDRY_LOCAL_WEB_ROOT=www
```

Default behavior is now `www/` static serving when `GAMEFOUNDRY_LOCAL_WEB_ROOT` is unset or empty.

When `GAMEFOUNDRY_LOCAL_WEB_ROOT=www`, local static serving explicitly prefers `www/` for public browser URLs while retaining repository-root fallback for compatibility during migration.

When local validation needs the prior root behavior, `GAMEFOUNDRY_LOCAL_WEB_ROOT=repo-root` resolves static files from the repository root.

This toggle is for local runtime and test helpers only. It does not change production deployment, public URLs, API routes, or package commands.

## Required Sequence For Safe www Move

1. Freeze the public route contract.
2. Move `index.html` and browser-served folders into `www/`.
3. Update local static server filesystem roots to resolve from `www/` for browser routes.
4. Preserve `/api/*` API routing before static fallback.
5. Preserve compatibility route aliases such as `/tools/*`.
6. Update Playwright repo server helper to mirror runtime static route resolution.
7. Update browser relative imports and links only where the move changes relative depth.
8. Update validation scripts and coverage prefix mapping for `www/` paths.
9. Run targeted Playwright lanes for root/home, account/admin, toolbox navigation, environment banner, and impacted tool flows.
10. Produce a compatibility ledger for any root path still supported temporarily.

## Validation Lanes Required For The Actual Move PR

Minimum validation for the actual `www/` move:

- `git diff --check`
- `npm run validate:canonical-structure`
- `node ./dev/scripts/run-platform-validation-suite.mjs`
- targeted Playwright route lanes touching:
  - root/home
  - account sign-in/session
  - admin owner navigation
  - toolbox navigation
  - Tool Display Mode
  - environment banner coverage
  - games index/discovery
- targeted runtime tests that assert `toolbox/{tool}/index.html` or filesystem existence.

Fallback validation if targeted routing failures are broad:

- `npm run test:workspace-v2`
- `npm run test:lane:tool-navigation`
- `npm run test:lane:tool-display-mode`
- impacted Playwright specs under `dev/tests/playwright/account/`, `dev/tests/playwright/games/`, and `dev/tests/playwright/tools/`.

## Owner Recommendation

Do not perform the browser move until the actual move PR explicitly owns:

- static server filesystem root migration,
- Playwright helper root migration,
- route compatibility ledger,
- browser relative import/link rewrites,
- validation script prefix updates,
- and targeted Playwright execution.

The next implementation PR should be a focused `www/` move PR that preserves public URLs while moving the filesystem root to `www/`.
