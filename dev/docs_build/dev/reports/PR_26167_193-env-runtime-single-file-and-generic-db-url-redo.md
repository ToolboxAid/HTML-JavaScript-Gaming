# PR_26167_193-env-runtime-single-file-and-generic-db-url-redo

## Branch Validation
- PASS - Current branch is `main`.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before redo work.

## Actual Changed Runtime/Config Files
- PASS - `.gitignore` updated so runtime env files are ignored with `.env` and `.env.*`, while `.env.example`, `.env.sample`, and `.env.template` remain trackable.
- PASS - `.env` removed from git tracking; local ignored file remains user-managed.
- PASS - `.env.uat` removed from git tracking; local ignored file remains user-managed.
- PASS - `scripts/validate-browser-env-agnostic.mjs` expanded from browser/page validation to active app/server/runtime/DB/example environment-branching validation.
- PASS - Runtime/config files already correct in active source and revalidated: `scripts/start-local-api-server.mjs`, `scripts/validate-supabase-dev.mjs`, `scripts/apply-supabase-dev-ddl.mjs`, `src/dev-runtime/auth/provider-contract-stubs.mjs`, `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`, and `tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`.

## Requirement Checklist
- PASS - Runtime loads only `.env`.
- PASS - Runtime does not auto-load `.env.local`, `.env.uat`, or `.env.prod`.
- PASS - Tests/validation may explicitly load `.env.local`; `npm run validate:supabase-dev` did so.
- PASS - `.gitignore` ignores `.env` and `.env.*`.
- PASS - `.env.example` remains trackable.
- PASS - `GAMEFOUNDRY_AUTH_PROVIDER` and `GAMEFOUNDRY_DB_PROVIDER` are absent from active runtime startup use.
- PASS - `GAMEFOUNDRY_SUPABASE_DATABASE_URL` is absent from active non-report paths.
- PASS - `GAMEFOUNDRY_DATABASE_URL` is used by active runtime/validation/DDL/provider/test paths.
- PASS - Ignored `.env.local` was normalized to the four required keys without printing values.
- PASS - Ignored `.env.uat` was normalized to the same key structure without printing values.
- PASS - No DEV/UAT/PROD deployment-label branching found across active app/server/API/service/DB runtime paths outside tests and validation exceptions.
- PASS - No local-db/mock-db/SQLite fallback was added by this redo.
- PASS - No silent fallback was introduced.

## Env Loading Evidence
- PASS - `scripts/start-local-api-server.mjs` defines `RUNTIME_ENV_FILE = ".env"`.
- PASS - `rg` found no `.env.local`, `.env.uat`, `.env.prod`, provider env vars, or provider-selection wording in runtime startup.
- PASS - Runtime validation temporarily copied `.env.local` to ignored `.env`, ran `npm run dev:local-api`, then restored the original local `.env`.
- PASS - Runtime startup output included `.env loaded for API runtime (4 key(s) applied).`
- PASS - Runtime startup output included `Configured auth connection: configured.`
- PASS - Runtime startup output included `Configured database connection: configured.`

## Rename Evidence
- PASS - Active non-report scan found no `GAMEFOUNDRY_SUPABASE_DATABASE_URL`.
- PASS - `.env.example`, runtime startup, Supabase DEV validation, DDL apply, provider contract stubs, and targeted tests use `GAMEFOUNDRY_DATABASE_URL`.
- PASS - Local ignored `.env.local` and `.env.uat` contain `GAMEFOUNDRY_DATABASE_URL`; values were not printed.

## Provider Var Removal Evidence
- PASS - `scripts/start-local-api-server.mjs` contains no `GAMEFOUNDRY_AUTH_PROVIDER` or `GAMEFOUNDRY_DB_PROVIDER`.
- PASS - `.env.example` contains no `GAMEFOUNDRY_AUTH_PROVIDER` or `GAMEFOUNDRY_DB_PROVIDER`.
- PASS - Runtime startup reports Auth connection and Database connection readiness, not provider selection.

## .env.local/.env.uat Creation Evidence
- PASS - `.env.local`: required key structure present; forbidden provider/old database keys absent; values not printed.
- PASS - `.env.uat`: required key structure present; forbidden provider/old database keys absent; values not printed.
- PASS - Both files are ignored by `.gitignore` and excluded from the ZIP.

## No Environment-Branching Evidence
- PASS - `npm run validate:browser-env-agnostic` wrote `docs_build/dev/reports/environment_agnostic_browser_gate_report.md`.
- PASS - The expanded gate scanned active roots: `account`, `admin`, `assets/theme-v2/js`, `toolbox`, `src/engine`, `src`, `scripts`, and `docs_build/database`.
- PASS - The expanded gate scanned runtime example/config files: `.env.example` and `package.json`.
- PASS - Files scanned: 798.
- PASS - Deployment-label branching findings: None.
- PASS - Account page dependency findings: None.
- PASS - Product service contract findings: None.
- PASS - User-facing implementation wording findings: None.
- PASS - Deprecated SQLite/Local DB technical debt findings: None.

## Validation Lane Report
- PASS - `node --check scripts/validate-browser-env-agnostic.mjs`
- PASS - `node --check scripts/start-local-api-server.mjs`
- PASS - `node --check scripts/validate-supabase-dev.mjs`
- PASS - `node --check scripts/apply-supabase-dev-ddl.mjs`
- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `npm run validate:supabase-dev`
  - PASS - Explicit `.env.local` DEV validation load.
  - PASS - Auth connection URL, anon key, service role key, and database connection URL configured with masked diagnostics.
  - PASS - Supabase Auth/REST identity tables reachable.
  - WARN - Direct PostgreSQL TLS reported `SELF_SIGNED_CERT_IN_CHAIN`; validator marked this advisory because REST/API identity readiness passed.
- PASS - `npm run dev:local-api` runtime check on alternate port after temporary `.env.local` to `.env` copy.
- PASS - `npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs --grep "Game Workspace creates|active-game API" --workers=1 --reporter=list` (2 passed).
- PASS - `npm run validate:browser-env-agnostic`
- SKIP - Full samples smoke, per instruction.

## Manual Validation Notes
- `.env.local` and `.env.uat` were updated locally as ignored copy-source files; no secret values were printed, reported, or packaged.
- Runtime validation used `.env` as the only startup-loaded env file and restored the original ignored `.env` immediately after the check.
- Targeted Game Workspace validation covered game create/open/delete and active-game API diagnostics without throwing.
- Redo ZIP excludes `.env`, `.env.local`, `.env.uat`, `tmp/` contents, `.log`, and `.pid` files.
