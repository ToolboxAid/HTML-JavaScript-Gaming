# Requirement Checklist: PR_26179_OWNER_035-dev-auth-user-key-db-authority

- PASS Do not use hardcoded user keys as runtime identity source.
- PASS Use email only to locate the existing DEV `users` row during DEV identity sync.
- PASS Read `users.key` from the database row during DEV sync.
- PASS Read `auth.users.id` from Supabase Auth during DEV sync.
- PASS Write `auth.users.id` into `users.authProviderUserId`.
- PASS Login/session resolution matches Supabase Auth id to `users.authProviderUserId`.
- PASS Do not create browser-owned auth.
- PASS Do not create fake login.
- PASS Do not add password tables.
- PASS Do not use `displayName` as an identity key.
- PASS Do not hardcode DavidQ/user keys in runtime login resolution.
- PASS Report where `users.key` currently comes from.
- PASS Report where `authProviderUserId` is populated.
- PASS Report whether seed constants are setup-only or runtime identity authority.
- PASS Report exact fix.

