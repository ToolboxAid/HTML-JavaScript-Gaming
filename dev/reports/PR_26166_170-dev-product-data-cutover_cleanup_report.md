# PR_26166_170 Test Data Cleanup Report

## Summary

PASS

- Supabase validation records created: none.
- Supabase validation records deleted: none.
- Required DEV seed/bootstrap records upserted:
  - `users`: 4 approved static DEV users.
  - `roles`: 4 default role slugs.
  - `user_roles`: 5 default assignments.
  - `toolbox_tool_metadata`: 45 product bootstrap rows.
  - `toolbox_tool_planning`: 45 product bootstrap rows.
- Live repository validation created an in-memory repository id only and did not persist a product record.
- No UAT/PROD resources were created.

## Cleanup Command

- PASS - `npm run cleanup:supabase-dev-auth-test-users`

Result:

- Created test records: 0
- Candidate test records: 0
- Deleted test records: 0
- Audit reassignment required: NO
- Audit dependency records: 0
- Audit reassignment records: 0
- Skipped non-test records: 12
- Overall Result: PASS

## Remaining Records

PASS

- The 12 skipped identity rows were not deleted because they did not match the DEV test-account allowlist (`codex-*` or `playwright-*` `@example.test`).
- Required DEV bootstrap rows remain in Supabase Postgres for product cutover validation.
- No Codex-created validation-only product records are known to remain from PR_170.
