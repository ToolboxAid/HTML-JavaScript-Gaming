# Manual Validation Notes: PR_26179_OWNER_035-dev-auth-user-key-db-authority

Manual browser validation was not run because this PR changes server-side auth/session resolution and DEV identity sync behavior. The targeted API-level tests and live API sign-in smoke cover the affected user-visible outcomes:

- A valid Supabase Auth id linked to `users.authProviderUserId` signs in and returns the database-owned `users.key`.
- A matching email with stale `users.authProviderUserId` does not sign in and returns the existing Creator-safe identity setup message.
- The browser response does not expose raw Auth ids or database user keys on the failure path.

Live DEV notes:

- Initial audit found Supabase Auth present but product `users` missing for `qbytes.dq@gmail.com`.
- The missing database row was caused by a toolbox helper upserting seed users over the reserved account keys.
- The helper was fixed so toolbox seeding no longer upserts `users`.
- The approved DEV account DML restored the missing rows.
- DEV identity sync ran with password updates disabled.
- Final `/api/auth/sign-in` smoke for `qbytes.dq@gmail.com` passed and resolved to the database `users.key`.
