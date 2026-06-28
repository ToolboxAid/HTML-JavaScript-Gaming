# PR_26179_OWNER_035-dev-auth-user-key-db-authority Requirement Checklist

Status: PASS

- Database `users` row is authoritative for `users.key`: PASS
- Runtime sign-in does not use hardcoded DavidQ/user keys: PASS
- Runtime sign-in does not use display name as identity key: PASS
- Supabase Auth id must match `users.authProviderUserId`: PASS
- Email is used only by DEV identity sync to locate existing DB rows: PASS
- DEV identity sync reads DB-owned `users.key`: PASS
- DEV identity sync writes Auth id to `users.authProviderUserId`: PASS
- Toolbox seed helper no longer upserts seed rows into `users`: PASS
- Existing Auth user password is not changed by default sync: PASS
- Required reports under `dev/reports/`: PASS
- Repo-structured ZIP under `dev/workspace/zips/`: PASS
