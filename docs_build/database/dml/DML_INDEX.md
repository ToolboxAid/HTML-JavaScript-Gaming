# DML Ownership Index

This index classifies each grouped DEV/review DML file.

Direct SQL setup is intentionally narrow. Account DEV users now require server-side Supabase Auth synchronization so `users.authProviderUserId` matches real `auth.users.id` values. Non-user setup is server-seed-owned so direct SQL does not bypass server/API key generation or audit ownership.

| Group | File | Status | Owner |
| --- | --- | --- | --- |
| Account | `account.sql` | Review-only | DEV static user shape; execute through server-side sync only |
| Admin | `admin.sql` | Server-seed-owned | Admin Site Setup/server-side seed API |
| Asset | `asset.sql` | Server-seed-owned | Server-side seed API |
| Controls | `controls.sql` | Server-seed-owned | Server-side seed API |
| Game Configuration | `game-configuration.sql` | Server-seed-owned | Server-side seed API |
| Game Design | `game-design.sql` | Server-seed-owned | Server-side seed API |
| Game Journey | `game-journey.sql` | Server-seed-owned | Server-side seed API |
| Game Hub | `game-workspace.sql` | Server-seed-owned | Server-side seed API |
| Messages | `messages.sql` | Server-seed-owned | Messages Local API/server-side SQLite service |
| Objects | `objects.sql` | Server-seed-owned | Server-side seed API |
| Palette | `palette.sql` | Server-seed-owned | Server-side seed API |
| Support Tickets | `support-tickets.sql` | Server-seed-owned | Admin Site Setup/server-side seed API |
| Tags | `tags.sql` | Server-seed-owned | Server-side seed API |
| Tool Metadata | `tool-metadata.sql` | Server-seed-owned | Server-side seed API |
| Tool Planning | `tool-planning.sql` | Server-seed-owned | Server-side seed API |
| Toolbox Votes | `toolbox-votes.sql` | Server-seed-owned | Server-side seed API |

## DEV Static User ULID Exception

Static ULIDs are allowed only for these DEV user records and required user-role join records:

- User 1
- User 2
- User 3
- DavidQ

All non-user records must use server/API-generated ULID-style keys.

## Browser Seed Prohibition

Browser pages must not seed authoritative records. Setup flows must call server-side APIs.
