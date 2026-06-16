# PR_26167_191-owner-operations-settings-and-role-cleanup

## Branch Validation

PASS - Current branch is `main`; expected branch is `main`.

## Summary

PASS - Added Owner > Operations as an owner-only operational surface with safe connection validation, sanitized connection summary, and manual-only planning actions for reseed, restore, migration, and promotion.

PASS - Kept Admin focused on admin review/settings surfaces by removing operational planning links from the server-provided Admin menu and affected Admin side menus.

PASS - Narrowed Platform Settings to runtime banner settings: active, message, and tone. Removed active `platform.banner.kind` and `site.setup.status` seed/fixture rows.

PASS - Removed the deprecated `roleSlug=user` row from DEV through the repeatable DEV identity sync and removed active seed/fixture definitions for that role.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Instructions read before edits. |
| Hard stop unless branch is `main` | PASS | Branch validation showed `main`. |
| Add Owner > Operations page/menu | PASS | `owner/operations.html`, `assets/theme-v2/js/owner-operations.js`, `/api/owner/operations/*`, and Owner menu route `owner-operations`. |
| Owner-only operational tools | PASS | Owner route protection added for `owner/`; API routes require `session.isOwner`. |
| Validate current connection | PASS | Owner Operations validates account and product-data connections through `/api/owner/operations/validate`. |
| Reseed/restore/migration/promotion actions | PASS | Actions are visible in Owner Operations and return manual-only `SKIP` diagnostics without browser execution. |
| Show configured connection summary without secrets | PASS | Owner Operations renders account/product-data status, manual switching policy, and `Secrets: not exposed`. |
| Do not allow browser/admin UI to edit `.env` or secrets | PASS | No `.env` editing path added; Owner actions are manual-only and server-gated. |
| Keep environment switching manual through config change and restart | PASS | API and UI state `manual-env-change-and-server-restart`. |
| Move operational planning/actions out of Admin/Site Settings | PASS | Dynamic Admin menu removed Environments, Game Migration, and Site Setup; affected Admin side menus now show Platform Settings, Tool Votes, Users only. |
| Remove/defer editable Site Settings branding controls | PASS | Dynamic Admin menu removed Branding/Themes/Site Settings controls from promoted nav; `admin/site-settings.html` defers code/content-owned settings. |
| Keep Platform Settings focused on banner active/message/tone/future toggles | PASS | Notice Type removed from Admin UI/API payload; server writes only `platform.banner.enabled`, `platform.banner.message`, `platform.banner.tone`. |
| Use `settingKey` business identity, not hardcoded row ULIDs | PASS | Platform banner rows resolve by `settingKey`; new rows use server-generated keys when missing. |
| Remove deprecated `roleSlug=user` from active code/seeds/tests/fixtures/DEV DB | PASS | Active scan found no `roleSlug: "user"`/`roleSlug="user"` seed definitions; live sync deleted role key `01KV6FVP0ASR2RRR9WXCBKTV6C`. |
| Remove stale `user_roles` rows for `roleSlug=user` or stale key | PASS | Live sync verification: `missingRoleReferenceUserRoles=[]`, `staleRequestedRoleReferences=[]`. |
| Stable active roles: guest, creator, admin, owner | PASS | Live sync verification: all four required roles active. |
| User 1, User 2, User 3 creator only | PASS | Live sync role evidence: user1Creator/user2Creator/user3Creator all PASS; no non-DavidQ admin/owner assignments. |
| DavidQ owner, admin, creator | PASS | Live sync role evidence: DavidQ owner/admin/creator all PASS. |
| Owner menu only for owner role | PASS | Targeted Playwright validates owner/admin/unauthenticated menu gating. |
| Admin menu only for admin role | PASS | Targeted Playwright validates admin menu remains admin-gated. |
| No inline script/style/event handlers | PASS | Targeted Playwright asserts `style`, inline `style`, and inline `script` count is zero on affected pages. |
| No browser-owned product data | PASS | Owner Operations and Platform Settings use server API/service clients only. |
| No DEV/UAT/PROD branching in browser logic | PASS | Browser code sends action ids to owner API; no browser environment selection or branching was added. |
| No local-db/mock-db/SQLite fallback | PASS | No fallback path added; actions fail visibly or return manual-only diagnostics. |

## Live DEV Identity Evidence

Before sync:

- Auth users: 4
- public.users: 4
- Canonical Auth users: 4
- Canonical public users: 4
- Extra managed Auth users: 0
- Extra managed public users: 0

After sync:

- Auth users: 4
- public.users: 4
- Canonical Auth users: 4
- Canonical public users: 4
- Extra managed Auth users: 0
- Extra managed public users: 0

Role evidence:

- User 1 creator: PASS
- User 2 creator: PASS
- User 3 creator: PASS
- DavidQ creator: PASS
- DavidQ admin: PASS
- DavidQ owner: PASS
- Non-DavidQ admin assignments: PASS, none
- Non-DavidQ owner assignments: PASS, none

Deleted role cleanup:

- Deleted role record: `roleSlug=user`, key `01KV6FVP0ASR2RRR9WXCBKTV6C`, deleted count `1`
- Deleted stale `user_roles`: `0` during this run because none remained before role deletion
- Missing role references after sync: `[]`
- Stale requested role references after sync: `[]`

## Platform Settings Evidence

PASS - Active platform settings seed/fixture scan found no `platform.banner.kind` or `site.setup.status` under active Admin/platform seed/runtime paths.

PASS - Platform Settings Admin UI now exposes:

- Banner message
- Show banner
- Tone
- Save Banner

PASS - Platform Settings API update writes 3 records: enabled, message, tone.

## Owner Operations Evidence

PASS - Targeted Playwright loaded `/owner/operations.html` as DavidQ with owner/admin/creator roles.

PASS - Owner menu displayed `DB Viewer`, `Design System`, `Grouping Colors`, `Notes`, and `Operations`.

PASS - Validate Current Connection returned PASS and wrote an executed result row.

PASS - Reseed DEV returned SKIP/manual-only and wrote a non-executed result row.

PASS - Connection summary showed account/product-data status and did not expose secrets.

## Validation Lane Report

| Command | Result | Notes |
| --- | --- | --- |
| `node --check` for changed JS/MJS files | PASS | Checked changed browser, server, sync, and test JS/MJS files. |
| `node --test tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs` | PASS | DEV identity sync deletes legacy `user` role in fake Supabase state. |
| `npm run validate:supabase-dev` | PASS | Supabase reachable; Auth/tables PASS. Advisory WARN for direct database TLS `SELF_SIGNED_CERT_IN_CHAIN`. |
| `node --use-system-ca scripts/sync-supabase-dev-creator-identities.mjs --json` | PASS | Live DEV sync succeeded; role evidence above. |
| `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs` | PASS | 9 tests passed for Owner Operations, Admin menu, and Platform Settings banner. |
| `npm run validate:browser-env-agnostic` | PASS | Wrote `environment_agnostic_browser_gate_report.md`. |
| `npm run test:workspace-v2` | PASS | Legacy command name; user-facing language is Project Workspace. 5 tests passed. |
| `git diff --check` | PASS | No whitespace errors; Git reported line-ending warnings only. |

Skipped:

- Full samples smoke: SKIP, explicitly out of scope.

## Manual Validation Notes

Manual-style browser validation was covered through targeted Playwright:

- Owner Operations loaded, displayed sanitized connection summary, validated current connection, and returned manual-only SKIP for Reseed DEV.
- Admin menu remained visible for admin role and hidden without admin role.
- Owner menu remained visible for owner role and hidden without owner role.
- Platform banner save/load still writes and reads platform-settings through the API/service contract.
- Platform banner renders under header and above footer; active=false removes rendered banners.

No interactive browser-only manual run was performed beyond Playwright automation.

## Test Data Cleanup

PASS - Live DEV sync created `0` test users and deleted `0` test users.

PASS - Live DEV sync deleted the stale `roleSlug=user` role row.

PASS - No Codex-created product records were created for this PR.

PASS - Playwright-generated `tmp/test-results` was removed after validation; repo `tmp/` was not used for logs/text/pid files.

## Playwright V8 Coverage

See `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

Changed browser JS coverage:

- `(100%) assets/theme-v2/js/admin-platform-settings.js`
- `(100%) assets/theme-v2/js/owner-operations.js`
- `(100%) src/engine/api/owner-operations-api-client.js`
- `(85%) assets/theme-v2/js/admin-service-page-data.js`
- `(78%) assets/theme-v2/js/gamefoundry-partials.js`

WARN-only V8 gaps:

- Server-side/dev-runtime modules are not collected by browser V8 coverage and are reported as advisory WARN.
