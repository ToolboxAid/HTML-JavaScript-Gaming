# Supabase DEV Identity Bootstrap

Use this only for the DEV Supabase project. Identity seeding is server-side only so app `users.authProviderUserId` values stay synchronized with real Supabase Auth `auth.users.id` values.

## Bootstrap Order

1. Run `docs_build/database/ddl/account/supabase-identity-tables.sql` in the Supabase SQL editor or through an approved operator SQL path.
2. Run `npm run validate:supabase-dev`.
3. Confirm these checks pass through REST/API:
   - `Service role authentication`
   - `users table`
   - `roles table`
   - `user_roles table`
4. Run `node .\scripts\sync-supabase-dev-creator-identities.mjs` against DEV only.

## Seed Rules

- Passwords remain owned by Supabase Auth.
- Do not create password tables.
- Browser JavaScript must not generate authoritative identity keys.
- Create Account provisions app `users`, `roles`, and `user_roles` records server-side.
- Static DEV identity sync provisions only User 1, User 2, User 3, and DavidQ.
- Authenticated users receive the `creator` role by default.
- The `guest` role remains for unauthenticated browsing.
- The `admin` role is preserved only for actual admin assignments.
- The legacy `user` role is deprecated and inactive.
- Static DEV user ULIDs are allowed only for these DEV seed users:
  - User 1: `01K2GFSJ0Y0000000000000051`
  - User 2: `01K2GFSJ0Y0000000000000052`
  - User 3: `01K2GFSJ0Y0000000000000053`
  - DavidQ: `01K2GFSJ0Y0000000000000054`
- Do not use static keys for games, assets, objects, controls, votes, tickets, tool metadata, tool planning, tool state records, guest seed data, roles, or user_roles.
- Do not use `authProvider: mock` for Supabase account identity records.

## Existing Auth Users

For existing DEV Supabase Auth users, provision app identity through the server/API provisioning path so the `users.authProviderUserId` value matches the real Supabase Auth user id.

Do not commit Supabase Auth user ids, access tokens, service role keys, database URLs, or DEV identity passwords in reports.
