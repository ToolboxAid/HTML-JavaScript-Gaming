# Manual Validation Notes: PR_26179_OWNER_035-dev-auth-user-key-db-authority

Manual browser validation was not run because this PR changes server-side auth/session resolution and DEV identity sync behavior. The targeted API-level tests cover the affected user-visible outcomes:

- A valid Supabase Auth id linked to `users.authProviderUserId` signs in and returns the database-owned `users.key`.
- A matching email with stale `users.authProviderUserId` does not sign in and returns the existing Creator-safe identity setup message.
- The browser response does not expose raw Auth ids or database user keys on the failure path.

Recommended manual follow-up in DEV after merge:

- Run the approved DEV identity sync.
- Sign in as `qbytes.dq@gmail.com`.
- Confirm the session resolves to the existing database `users.key` row whose `authProviderUserId` equals the Supabase Auth user id.

