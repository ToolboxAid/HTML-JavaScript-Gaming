# PR_26179_OWNER_035-dev-auth-user-key-db-authority Manual Validation Notes

Status: READY FOR OWNER VALIDATION

Manual checks after merge:

1. Run the approved DEV identity sync against DEV.
2. Confirm `qbytes.dq@gmail.com` exists in Supabase Auth.
3. Confirm `qbytes.dq@gmail.com` exists in the product `users` table.
4. Confirm product `users.authProviderUserId` equals Supabase Auth `auth.users.id`.
5. Sign in as `qbytes.dq@gmail.com` without changing password.
6. Confirm the resolved session uses the database `users.key`.

Packaging note:

- Read-only pre-package verification found the Auth user present but the product users row missing on the current DEV target.
- The mutating DEV identity sync was intentionally not run during this package/push step.
