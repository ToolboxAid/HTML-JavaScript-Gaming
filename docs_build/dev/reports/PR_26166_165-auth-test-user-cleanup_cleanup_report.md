# PR_26166_165 Auth Test User Cleanup Report

## Summary

PASS

- Created test records during PR_165: none.
- Dry-run before cleanup: 7 matching Supabase-auth test-account candidates.
- Delete run: 7 matching test records deleted from the app identity table.
- Final dry-run after cleanup: 0 matching candidates.
- Non-test users were skipped and not deleted.
- UAT/PROD were not touched.

## Matching Rule

The cleanup only targets users that satisfy all of these conditions:

- `authProvider` is `supabase-auth`.
- `authProviderUserId` is present.
- Email matches `codex-*` or `playwright-*` at `example.test`.
- User key is not one of the static DEV user exceptions.

## Created Test Records

None.

## Pre-Cleanup Dry-Run Candidates

- `codex-pr156-1781555647052-44df0842@example.test` userKey=`01KV6FVNXBGQWRMAHAT994S4CW`
- `codex-pr156-session-1781555681463-772702@example.test` userKey=`01KV6FWQ35QBXT2CXPR0TKANFN`
- `codex-pr157-160-1781557811826-cbba99@example.test` userKey=`01KV6HXRBKW27SB3Y9PCZVZ5JP`
- `codex-pr157-160-1781557880857-f21b68@example.test` userKey=`01KV6HZV2GW5K5428TP9NSHKE5`
- `codex-pr161-create-1781560208113-777e5d@example.test` userKey=`01KV6M6VSGH4N1PF02NE2P1ZW4`
- `codex-pr26166-mqftqbp8@example.test` userKey=`01KV6RNFD2VNF5SMK6Z7PW5J04`
- `codex-pr26166-live-mqfue66y@example.test` userKey=`01KV6SQE8XWCATB1TPQNW2STH0`

## Audit Dependency Handling

- One shared account audit dependency was found before cleanup.
- Table: `roles`
- Row key: `01KV6FVP0ASR2RRR9WXCBKTV6C`
- Fields: `createdBy`, `updatedBy`
- Reassigned to explicit surviving DEV audit user key: `01KV6R2GKPZDAWNKM1N65SHZY5`
- Reassigned fields: 2

## Deleted Test Records

- `codex-pr156-1781555647052-44df0842@example.test` userKey=`01KV6FVNXBGQWRMAHAT994S4CW`; Auth deleted=false; Auth not found=true; role audit refs reassigned=2; user_roles deleted=0; users deleted=1
- `codex-pr156-session-1781555681463-772702@example.test` userKey=`01KV6FWQ35QBXT2CXPR0TKANFN`; Auth deleted=true; Auth not found=false; role audit refs reassigned=0; user_roles deleted=1; users deleted=1
- `codex-pr157-160-1781557811826-cbba99@example.test` userKey=`01KV6HXRBKW27SB3Y9PCZVZ5JP`; Auth deleted=true; Auth not found=false; role audit refs reassigned=0; user_roles deleted=1; users deleted=1
- `codex-pr157-160-1781557880857-f21b68@example.test` userKey=`01KV6HZV2GW5K5428TP9NSHKE5`; Auth deleted=true; Auth not found=false; role audit refs reassigned=0; user_roles deleted=1; users deleted=1
- `codex-pr161-create-1781560208113-777e5d@example.test` userKey=`01KV6M6VSGH4N1PF02NE2P1ZW4`; Auth deleted=true; Auth not found=false; role audit refs reassigned=0; user_roles deleted=1; users deleted=1
- `codex-pr26166-mqftqbp8@example.test` userKey=`01KV6RNFD2VNF5SMK6Z7PW5J04`; Auth deleted=true; Auth not found=false; role audit refs reassigned=0; user_roles deleted=1; users deleted=1
- `codex-pr26166-live-mqfue66y@example.test` userKey=`01KV6SQE8XWCATB1TPQNW2STH0`; Auth deleted=true; Auth not found=false; role audit refs reassigned=0; user_roles deleted=1; users deleted=1

## Final Cleanup Confirmation

- Command: `npm run cleanup:supabase-dev-auth-test-users -- --dry-run --json`
- `testDataCandidates`: 0
- `testDataCreated`: 0
- `testDataDeleted`: 0 in final dry-run mode
- `auditReassignmentRequired`: false
- `status`: PASS

## Non-Test Records Skipped

Six users were skipped because they did not match the DEV test-account pattern. They were not deleted.
