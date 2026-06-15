# PR_26166_139-supabase-dev-project-creation-guide

## Branch Validation

PASS - Current branch verified as `main`.

## Scope

PASS - Report-only Supabase DEV project creation guide.
PASS - Supabase was not activated.
PASS - Runtime behavior was not changed.
PASS - No secrets, password tables, dependencies, or SQL execution were added.

## Source Position

PR138 closed with Local DB active by default and Supabase inactive until user-provided DEV configuration exists.

Current default local settings remain:

- `GAMEFOUNDRY_AUTH_PROVIDER=local-db`
- `GAMEFOUNDRY_DB_PROVIDER=local-db`

Supabase DEV activation must wait until the user creates the DEV project and supplies local-only environment values outside source control.

## Supabase DEV Project Creation Checklist

Recommended project name:

- `GameFoundryStudio-DEV`

User-executed steps:

1. Sign in to Supabase with the account that will own or administer the DEV project.
2. Create a new Supabase project named `GameFoundryStudio-DEV`.
3. Select the intended organization/workspace owner.
4. Choose a DEV-safe region and database password in Supabase.
5. Store the database password in the user's password manager or approved local secret store.
6. Wait for Supabase project provisioning to complete.
7. Open the Supabase project dashboard.
8. Locate the project API settings.
9. Copy the project URL only into local environment storage.
10. Copy the anon public key only into local environment storage.
11. Copy the service role key only into server-only local environment storage.
12. Locate the direct Postgres/database connection string only if the next activation PR asks for it.
13. Keep all copied values out of Git, reports, screenshots, chat, and ZIP artifacts.

## Auth Email/Password Settings

User-executed Supabase settings checklist:

- Enable email/password authentication for DEV.
- Keep password storage owned by Supabase Auth.
- Do not create app-owned password tables.
- Keep email confirmation behavior DEV-safe and document the selected setting before activation.
- Enable password reset through Supabase Auth.
- Confirm password reset redirects return to the local password reset page.
- Keep OAuth providers disabled until a future dedicated provider PR.

## Redirect URLs

Use the actual local origin that the user will run during DEV validation. Do not commit the resulting values.

Required DEV redirect entries to configure in Supabase:

- Site URL: local development origin.
- Sign-in redirect: local development origin plus `/account/sign-in.html`.
- Create-account redirect: local development origin plus `/account/create-account.html`.
- Password-reset redirect: local development origin plus `/account/password-reset.html`.

Rules:

- Use exact local origins for DEV.
- Do not add UAT or PROD redirects in the DEV project.
- Do not use wildcard redirects unless a later security review explicitly approves them.
- Re-check redirect URLs before OAuth or UAT work.

## Required Local Environment Variable Names

Store values outside source control. The repo may document names only.

Provider selectors:

- `GAMEFOUNDRY_AUTH_PROVIDER`
- `GAMEFOUNDRY_DB_PROVIDER`

Browser-safe Supabase values:

- `GAMEFOUNDRY_SUPABASE_URL`
- `GAMEFOUNDRY_SUPABASE_ANON_KEY`

Server-only Supabase values:

- `GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY`
- `GAMEFOUNDRY_SUPABASE_DATABASE_URL`

Initial local state before activation:

- `GAMEFOUNDRY_AUTH_PROVIDER` remains `local-db`.
- `GAMEFOUNDRY_DB_PROVIDER` remains `local-db`.
- Supabase values may exist locally for diagnostics, but Supabase is not active until a later activation PR changes provider selectors.

## Where To Store Local Env Values

Allowed local-only storage:

- User shell profile environment variables.
- A local untracked `.env` file, if the user's local startup flow loads it.
- OS/user secret manager.
- Hosting/provider secret storage for future UAT/PROD, user-controlled only.

Rules:

- Do not commit real `.env` files.
- Do not paste real values into reports.
- Do not paste real values into screenshots.
- Do not paste real values into chat.
- Do not put service-role or database URL values in browser JavaScript.
- Do not add real values to `.env.example`; it must remain names-only with empty values.

## Confirmation Checklist For The User

Before asking Codex for the next activation PR, confirm:

- Supabase project `GameFoundryStudio-DEV` exists.
- Email/password auth is enabled for DEV.
- Required redirect URLs are configured for the active local origin.
- Local env storage contains the required variable names and real values.
- `.env.example` still contains no real values.
- Real values are not present in Git status, reports, screenshots, or ZIPs.
- Provider selectors still point to Local DB until the activation PR.

## What Codex Should Verify After Env Vars Exist

After the user confirms local env values exist, Codex should verify in the next PR:

- Local API starts.
- Provider contract still defaults to `local-db/local-db` until selectors are changed.
- Supabase Auth readiness reports PASS when local values are present.
- Supabase Postgres readiness reports PASS when server-only local values are present.
- Browser-facing diagnostics do not expose server-only values or server-only variable names.
- Selecting Supabase without complete config fails visibly.
- Selecting Supabase with complete DEV config is ready only after explicit activation scope.
- Admin Site Setup readiness reports the expected Supabase DEV setup status.
- No automatic fallback to Local DB occurs when Supabase is selected and fails.

## UAT/PROD Execution Boundary

PASS - User creates the Supabase DEV project.
PASS - User supplies local env values.
PASS - Codex does not commit secrets.
PASS - Codex may prepare reviewed SQL/setup artifacts in future PRs.
PASS - Codex does not execute UAT or PROD SQL.
PASS - UAT/PROD SQL/setup execution remains user-controlled.
PASS - No automatic fallback to Local DB is allowed when Supabase is selected and fails.

## Secrets Audit

PASS - This guide names required environment variables but includes no real values.
PASS - No Supabase URL, anon key, service-role key, database URL, database password, JWT, or OAuth client secret was added.
PASS - No fake placeholder key/value was committed.
PASS - No password tables or password storage behavior were added.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution | PASS | File read before PR139 execution. |
| Verify current branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Scope to user-executed Supabase DEV project creation guide only | PASS | Only this report and shared Codex artifacts changed. |
| Do not activate Supabase | PASS | No runtime or env selector change. |
| Do not add secrets | PASS | Variable names only; no values. |
| Do not change runtime behavior | PASS | No runtime files changed. |
| Include project creation steps | PASS | Checklist included. |
| Include recommended project name | PASS | `GameFoundryStudio-DEV`. |
| Include auth email/password settings | PASS | Settings checklist included. |
| Include redirect URLs | PASS | Local redirect paths documented without concrete origin values. |
| Include required env var names with no values | PASS | Names listed only. |
| Include where user should store env vars locally | PASS | Local-only storage section included. |
| Include confirmation checklist | PASS | User confirmation checklist included. |
| Include what Codex should verify after env vars exist | PASS | Verification list included. |
| State user creates Supabase project | PASS | Explicitly documented. |
| State user supplies local env values | PASS | Explicitly documented. |
| State Codex does not commit secrets | PASS | Explicitly documented. |
| State Codex does not execute UAT/PROD SQL | PASS | Explicitly documented. |
| State no automatic fallback to Local DB when Supabase selected fails | PASS | Explicitly documented. |
| Playwright impacted: No | PASS | Report-only PR; no UI/runtime changes. |

## Validation Lane Report

Executed:

- `git branch --show-current` - PASS, `main`
- `git diff --check` - PASS
- Report existence validation - PASS
- Runtime file change validation - PASS, no runtime files changed
- Secret/fake value scan - PASS, no real Supabase secrets or fake key values added

Skipped:

- Playwright - SKIP, report-only PR with no UI/runtime changes.
- Runtime Node tests - SKIP, no runtime code changed.
- Full samples smoke - SKIP, report-only PR outside samples scope.

## Manual Validation Notes

PASS - `docs_build/dev/reports/pr139-supabase-dev-project-creation-guide.md` exists.
PASS - The guide is user-executed and does not activate Supabase.
PASS - The guide keeps Codex out of UAT/PROD SQL execution.

## ZIP

PASS - Repo-structured delta ZIP produced at `tmp/PR_26166_139-supabase-dev-project-creation-guide_delta.zip`.
