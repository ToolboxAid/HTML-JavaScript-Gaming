# PR_26160_079 Browser Storage Product Data Audit

Generated: 2026-06-09

## Branch Validation

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| Current branch | `main` | `main` | PASS |

## Scope

Audited active `localStorage` and `sessionStorage` usage for product data, with focus on Toolbox, Admin, and Colors paths. Deprecated archive paths, reports, generated artifacts, and `node_modules` were excluded from the active-code decision.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Audit `localStorage` / `sessionStorage` usage for product data | PASS | Static audits listed below. |
| Report anything that should move behind API/DB adapter | PASS | `toolboxaid.projectSystem.activeManifest` is identified as a product-shaped Workspace manifest persistence path that should move in a future Workspace/API migration. |
| Do not remove runtime-only UI state | PASS | Runtime-only handoff, dirty-session, live preview, inspector, and header state were preserved. |
| Migrate only safe Toolbox/Admin/Colors product data if found | PASS | No safe scoped Toolbox/Admin/Colors storage migration was found; no runtime changes made. |
| Produce per-PR reports, diff, changed files, validation notes, ZIP | PASS | Report and package artifacts generated for this PR. |

## Active Storage Findings

| File | Storage | Key / Data | Classification | Runtime Effect | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `src/shared/toolbox/projectSystem.js` | `localStorage` | `toolboxaid.projectSystem.activeManifest` via `ACTIVE_PROJECT_STORAGE_KEY` | Product-shaped Workspace manifest persistence | Stores active workspace manifest and tool state snapshots between interactions. | MIGRATE in a dedicated Workspace/API PR. Not migrated here because it crosses Workspace lifecycle, tool adapters, dirty-state, save/open, and manifest validation behavior. |
| `src/tools/common/WorkspaceDirtyNotifier.js` | `sessionStorage` | `workspace.tools.<toolId>` and host context id | Runtime-only unsaved workspace dirty handoff | Marks hosted Workspace Manager tool payload dirty inside the browser session. | KEEP. This is temporary draft/dirty state allowed by governance. |
| `src/tools/common/GameManifestLoader.js` | `sessionStorage` | `hostContextId` Workspace launch context | Runtime-only launch handoff | Loads a manifest passed by Workspace Manager for hosted tool launches. | KEEP for now; consider API-backed hosted-launch context during Workspace migration. |
| `src/shared/toolbox/toolHostSharedContext.js` | `sessionStorage`, fallback `localStorage` | `toolboxaid.toolHost.context.<contextId>` | Runtime-only hosted tool context | Stores temporary context for tool-to-tool hosted launches. | KEEP. Not durable product SSoT. |
| `src/shared/toolbox/platformShell.js` | `localStorage` | `toolboxaid.toolsPlatform.headerExpanded` | UI preference | Remembers tool header expanded/collapsed state. | KEEP. UI state only. |
| `src/shared/toolbox/platformShell.js` | `localStorage` / `sessionStorage` through storage services | `toolboxaid.toolsPlatform.launchSignature` and `toolboxaid.*` cleanup | Runtime launch cleanup / UI state | Clears stale transient launch/tool state when entering a new workspace launch. | KEEP. Not product SSoT. |
| `src/shared/toolbox/livePreviewSyncChannel.js` | `localStorage` fallback | `__toolboxaid_live_preview_sync_v1__` | Runtime message bridge fallback | Broadcasts live preview state when `BroadcastChannel` is unavailable. | KEEP. Transient sync bridge only. |
| `src/shared/toolbox/debugInspectorData.js` | None directly | Reads passed local/session storage entries into diagnostics | Diagnostic display | Displays storage snapshots supplied by caller. | KEEP. Diagnostic only. |
| `src/dev-runtime/persistence/mock-db-store.js` | `localStorage` | `gamefoundry.mockDb.v1`, `gamefoundry.mockDb.sessionUser.v1`, `gamefoundry.mockDb.sessionMode.v1` | Dev-runtime Local Mem persistence and local session state | Persists Local Mem DB/session mode/session user for local development. | KEEP within `src/dev-runtime/` for this PR. It is the configured Local Mem persistence mechanism, not a page-local Toolbox/Admin/Colors product array. |
| `src/shared/contracts/*.js` | None directly | Contract terms include `localStorage` / `sessionStorage` | Contract metadata | Defines allowed storage labels in product contracts. | KEEP. No runtime storage read/write. |
| `src/engine/persistence/*.js` | Generic storage adapters | Browser storage service classes | Shared infrastructure | Storage abstraction used by multiple runtime features. | KEEP. Engine migration is out of scope. |

## Toolbox/Admin/Colors Result

Targeted scan of `toolbox/colors`, `admin`, and `assets/theme-v2/js` found no direct `localStorage` or `sessionStorage` use. No safe active Toolbox/Admin/Colors product-data migration was available in this PR.

## Deferred Migration Item

`src/shared/toolbox/projectSystem.js` still stores the active Workspace manifest in `localStorage`. That is product-shaped state and should move to an API/service contract backed by a DB adapter. The safe path should be a dedicated Workspace persistence PR because the current code coordinates:

- active workspace manifest load/save/close
- dirty-state detection
- tool adapter state capture/apply
- external preset application
- shared asset/palette handoff cleanup
- Workspace Manager hosted launch behavior

## Validation

| Lane | Status | Command | Evidence |
| --- | --- | --- | --- |
| Branch guard | PASS | `git branch --show-current` | Returned `main`. |
| Active Colors/Admin/theme storage scan | PASS | `rg -n "localStorage\|sessionStorage" toolbox/colors admin assets/theme-v2/js --glob '!**/node_modules/**'` | No matches. |
| Active toolbox/runtime storage scan | PASS | `rg -n "localStorage\|sessionStorage" src/shared/toolbox src/tools/common src/dev-runtime/persistence/mock-db-store.js --glob '!**/node_modules/**'` | Findings classified above. |
| Static diff validation | PASS | `git diff --check` | No whitespace errors. |

## Skipped Lanes

| Lane | Status | Reason |
| --- | --- | --- |
| Playwright | SKIP | Audit/report-only PR with no runtime or UI behavior changes. |
| Full samples validation | SKIP | Samples and shared sample loaders were not changed. |

## Manual Test Notes

No manual browser walkthrough was required because PR_079 only documents storage ownership and does not change runtime behavior.
