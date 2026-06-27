# PR_26166_129 Local DB Migration Audit

## Branch Validation

- PASS: Current branch is `main`.
- Expected branch: `main`.
- Starting state: current repo after PR_26166_128; worktree was clean before this report-only PR.

## Scope Guard

- PASS: Stayed in the DB migration lane.
- PASS: Did not activate Supabase.
- PASS: Did not add Supabase runtime behavior.
- PASS: Did not add secrets.
- PASS: Did not introduce MEM DB, `local-mem`, fake login, or `login.html`.
- PASS: Preserved `Browser -> API/Service Contract -> Database`.
- PASS: No runtime code changes were made for PR129.

## Audit Method

Active areas searched:

- `toolbox/`
- `admin/`
- `account/`
- `src/engine/api/`
- `src/dev-runtime/server/`
- `src/dev-runtime/persistence/`
- `src/dev-runtime/guest-seeds/`
- directly relevant tests and prior DB audit reports

Excluded areas:

- `archive/v1-v2/`
- `start_of_day/`
- `node_modules/`
- `tmp/`
- generated test output

Commands included targeted `rg` scans for hardcoded arrays, browser storage, Local API routes, DB Viewer grouping, and ownership tables, plus a Local API route smoke on port `5538`.

## Migrated Areas

| Area | Evidence | Status |
| --- | --- | --- |
| Toolbox registry page | `toolbox/tools-page-accordions.js` reads `toolbox/tool-registry-api-client.js`, which calls `/api/toolbox/registry/snapshot`. | PASS: API-backed for active page rendering. |
| Toolbox tool metadata | Local API snapshot returned `toolbox_tool_metadata: 45`; route `/api/toolbox/registry/snapshot` returned `45` tools and `45` active tools. | PASS: Local API-backed. |
| Tool planning | Local API snapshot returned `toolbox_tool_planning: 45`; planning rows are merged into registry snapshot by `LocalDevDataSource.toolRegistrySnapshot()`. | PASS: Local API-backed. |
| Toolbox votes | `toolbox-votes-api-client.js` uses `/api/toolbox/votes/*`; route smoke returned `45` vote snapshot rows. | PASS: Local API-backed. |
| Users | `/api/session/users` returned `5` session user entries; Local DB snapshot returned `users: 5`. | PASS: Local API-backed. |
| Roles | Local DB snapshot returned `roles: 4`. | PASS: Local API-backed. |
| User roles | Local DB snapshot returned `user_roles: 7`; Admin DB Viewer relationship checks validate `user_roles.userKey` and `user_roles.roleKey`. | PASS: Local API-backed. |
| Assets constants and records | `assets-api-client.js` reads server constants; repository calls are routed through `createServerRepositoryClient("assets")`. | PASS with review note: browser file still owns UI column labels/status labels, not product records. |
| Colors/Palette constants and records | `palette-api-client.js` reads palette constants and repository through Local API. | PASS: API-backed, with catalog constants owned by dev-runtime server-side config. |
| Game Workspace, Game Design, Game Configuration, Game Journey, Tags | API clients read constants and repositories through Local API. | PASS: API-backed for active first-class tool routes. |

## Partially Migrated Areas

| Area | Remaining browser-owned data | Risk | Recommended next PR |
| --- | --- | --- | --- |
| Objects tool | `toolbox/objects/objects.js` owns `CAPABILITY_LABELS`, `OBJECT_TYPE_TEMPLATES`, and `STARTER_OBJECTS`. Local API currently serves only `OBJECTS_TOOL_TABLES` for Objects constants. | High: starter creator records and template catalog can become competing product data. | PR130: move Objects templates/starter catalog/capability labels behind `/api/toolbox/objects/constants` or a Local API catalog route. |
| Controls tool | `toolbox/controls/controls.js` owns `CONTROL_EVENT_OPTIONS`, `GAME_CONTROL_NORMALIZED_INPUTS`, `NORMALIZED_USAGE_LABELS`, `COMMON_DEFAULT_GAME_CONTROLS`, and `ENGINE_OWNED_NORMALIZED_INPUTS`. Local API currently serves only `INPUT_MAPPING_TOOL_TABLES`. | Medium: options/defaults shape created mappings and should be server-owned before Supabase activation. | PR131: move Controls option/default catalogs behind `/api/toolbox/controls/constants`; keep engine normalized input registry as engine contract. |
| Tool registry compatibility module | `toolbox/toolRegistry.js` still re-exports the dev-runtime registry for tests/legacy imports. Active toolbox rendering uses `tool-registry-api-client.js`. | Medium: not active page ownership, but it preserves a browser import path to static registry data. | PR132: retire or test-only isolate `toolbox/toolRegistry.js` consumers after active tests move to API snapshots or fixtures. |
| Shared document mode guard | `src/shared/toolbox/documentModeGuards.js` owns `TOOL_REGISTRY_BY_ID` for older editor route forwarding and uses transient browser storage for handoff payloads. | Medium: route map is static and outside Local API; storage appears transient, not product-data SSoT. | PR133: move legacy route map behind an API/contract fixture or explicitly classify it as non-product transient routing. |
| Game Workspace repository seeds | `game-workspace-mock-repository.js` owns DEV seed users/games/members. | Medium: dev seed behavior is acceptable for Local DB bridge, but should converge to Admin -> Site Setup before Supabase DEV. | PR134: move seed ownership review into Admin Site Setup plan before Supabase activation. |
| Runtime default game/user keys | Objects, Controls, Tags, and Assets repositories still contain DEV default IDs/user keys for missing active game/session cases. | Medium: can behave like hidden defaults if a route is missing session/game context. | PR135: replace repository-level hidden defaults with visible Local API diagnostics for missing active game/user context. |

## Remaining Browser-Owned Product Data

High-confidence remaining browser-owned product data:

- `toolbox/objects/objects.js`
  - `OBJECT_TYPE_TEMPLATES`
  - `STARTER_OBJECTS`
  - `CAPABILITY_LABELS`
- `toolbox/controls/controls.js`
  - `CONTROL_EVENT_OPTIONS`
  - `GAME_CONTROL_NORMALIZED_INPUTS`
  - `NORMALIZED_USAGE_LABELS`
  - `COMMON_DEFAULT_GAME_CONTROLS`
  - `ENGINE_OWNED_NORMALIZED_INPUTS`

Lower-risk browser/static compatibility data:

- `toolbox/toolRegistry.js`
  - compatibility export from `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`; active page rendering uses Local API instead.
- `src/shared/toolbox/documentModeGuards.js`
  - legacy editor route map and transient storage handoff.

Not classified as product-data ownership:

- `toolbox/assets/assets.js` upload table columns, source help copy, and upload status labels.
- `toolbox/colors/colors.js` local editor state arrays such as `editorIssues`, `editorTags`, and `harmonyRows`; durable palette constants and records are API-backed.
- `toolbox/tools-page-accordions.js` local render state and vote row cache; source rows come from Local API.

Browser storage audit:

- PASS: No active `toolbox/`, `admin/`, or `account/` page direct `localStorage`, `sessionStorage`, `indexedDB`, or cookie product-data ownership was found.
- WARN: Shared shell files still use `LocalStorageService`/`SessionStorageService` for UI state and transient payload handoff. These should remain non-authoritative and be reviewed before Supabase activation.

## Admin DB Viewer Grouping Audit

Local API route smoke returned server-provided DB Viewer groups in this order:

1. All
2. Asset
3. Controls
4. Game Configuration
5. Game Design
6. Game Journey
7. Game Workspace
8. Objects
9. Palette
10. Tags
11. Tool Metadata
12. Tool Planning
13. Tool State Samples
14. Toolbox Votes
15. User Roles

Findings:

- PASS: DB Viewer groups are generated server-side by `dbViewerGroupsForSnapshot()` and consumed by `local-db-viewer-ui.js`; the browser does not own grouping/order.
- PASS: User-facing group labels are browseable and mostly alphabetical after the intentional `All` first option.
- PASS: `toolbox_vote_order` is listed as a possible grouped table owner but absent when no table exists; Playwright already asserts it does not render as an empty phantom table.
- WARN: The `User Roles` group internally orders tables as `users`, `user_roles`, `roles`. This is relationship-oriented, not alphabetical. Keep as documented intentional identity relationship order or adjust in a follow-up.
- WARN: `All` first is an intentional filter-order exception and should remain documented when DB Viewer grouping changes.

## Local API Ownership Evidence

Route smoke on `npm run dev:local-api` via `npm.cmd`, port `5538`:

```json
{
  "activeProviders": {
    "authProviderId": "local-db",
    "databaseProviderId": "local-db"
  },
  "registryTools": 45,
  "registryActiveTools": 45,
  "tableCounts": {
    "toolbox_tool_metadata": 45,
    "toolbox_tool_planning": 45,
    "toolbox_votes": 0,
    "users": 5,
    "roles": 4,
    "user_roles": 7
  },
  "toolboxVoteRows": 45,
  "sessionUsers": 5,
  "objectsConstantKeys": ["OBJECTS_TOOL_TABLES"],
  "controlsConstantKeys": ["INPUT_MAPPING_TOOL_TABLES"]
}
```

Interpretation:

- PASS: Local DB remains the active auth/database provider.
- PASS: Toolbox metadata/planning/user/role tables are Local API-backed.
- PASS: Toolbox vote snapshot is API-backed even when no raw votes exist.
- WARN: Objects and Controls constants endpoints currently expose only table names, confirming their browser-owned option/template catalogs remain.

## Recommended Next PR Sequence

1. PR130 Objects Local API catalog migration
   - Move object type templates, starter objects, and capability labels behind Local API constants/catalog.
   - Add targeted Objects Playwright coverage for template selection and starter seeding.
2. PR131 Controls Local API catalog migration
   - Move event option labels, normalized input list, usage labels, and default controls behind Local API constants.
   - Add targeted Controls Playwright coverage for default enablement and event fields.
3. PR132 Tool registry compatibility cleanup
   - Remove or test-isolate `toolbox/toolRegistry.js` static browser registry bridge.
   - Update tests to use Local API snapshot fixtures where practical.
4. PR133 Shared legacy route map review
   - Move `documentModeGuards.js` static route map to an API/contract source or explicitly classify it as non-product legacy routing.
5. PR134 Admin Site Setup seed ownership plan
   - Move long-term seed/setup behavior out of repository defaults and into Admin -> Site Setup.
6. PR135 Hidden default cleanup
   - Replace repository default game/user keys with visible actionable diagnostics where active context is missing.
7. Supabase DEV activation PR
   - Start only after PR130-PR135 blockers are either migrated or explicitly accepted as non-product/transient.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- PASS: Started from current repo state after PR_26166_128.
- PASS: Did not activate Supabase.
- PASS: Did not add Supabase runtime behavior.
- PASS: Did not add secrets.
- PASS: Did not introduce MEM DB, `local-mem`, fake-login, or `login.html`.
- PASS: Preserved `Browser -> API/Service Contract -> Database`.
- PASS: Audited toolbox/tools pages for remaining hardcoded product data arrays.
- PASS: Audited Admin DB Viewer grouping/order against project rules.
- PASS: Audited Local API-backed routes/data ownership for tools/tool metadata, tool planning, toolbox votes, users, roles, and user_roles.
- PASS: Listed migrated areas.
- PASS: Listed partially migrated areas.
- PASS: Listed remaining browser-owned data.
- PASS: Listed recommended next PR sequence.
- PASS: Made no code changes; report-only audit was sufficient.

## Validation Lane Report

- Impacted lane: DB migration audit/reporting.
- Runtime JavaScript changed: No.
- Playwright impacted: No.
- Node syntax checks: SKIP, no JS/MJS files changed in PR129.
- Targeted Node tests: SKIP, no runtime code changed.
- Targeted Playwright: SKIP, no admin/tool page behavior changed.
- Local API route smoke: PASS, run to verify audited data ownership routes.
- Full samples smoke: SKIP, audit/report-only PR with no sample changes.

## Commands Run

- PASS: `git branch --show-current` returned `main`.
- PASS: `rg` audits over active toolbox/admin/account/src areas for hardcoded arrays, browser storage, Local API routes, and DB Viewer grouping.
- PASS: `npm run dev:local-api` route smoke through `npm.cmd` on port `5538`.
- PASS: `/api/local-db/snapshot`.
- PASS: `/api/toolbox/registry/snapshot`.
- PASS: `/api/toolbox/votes/snapshot`.
- PASS: `/api/session/users`.
- PASS: `/api/providers/contract`.
- PASS: `/api/toolbox/objects/constants`.
- PASS: `/api/toolbox/controls/constants`.
- PASS: `git diff --check`.

## Manual Validation Notes

- Disposable Local API logs under `tmp/pr129-local-api*.log` were removed after route smoke.
- No runtime file was modified for PR129.
- No Playwright V8 coverage was required because runtime JavaScript did not change.
- Required ZIP: `tmp/PR_26166_129-local-db-migration-audit_delta.zip`.
