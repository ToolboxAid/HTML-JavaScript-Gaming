# PR_26167_194-env-runtime-real-fix

## Branch Validation
- PASS - Current branch is `main`.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before changes.

## Actual Runtime/Config Files Reviewed or Changed
- Changed runtime JS: `toolbox/game-workspace/game-workspace.js`
- Changed targeted Playwright validation: `tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`
- Generated/updated reports: `docs_build/dev/reports/playwright_v8_coverage_report.txt`, `docs_build/dev/reports/coverage_changed_js_guardrail.txt`, this PR report.
- Runtime/config files inspected and validated without tracked changes in this PR: `scripts/start-local-api-server.mjs`, `scripts/validate-supabase-dev.mjs`, `scripts/apply-supabase-dev-ddl.mjs`, `src/dev-runtime/auth/provider-contract-stubs.mjs`, `.gitignore`, `.env.example`.
- Ignored local copy-source/runtime files updated but not tracked or packaged: `.env`, `.env.local`, `.env.uat`.

## Requirement Checklist
- PASS - Main branch only; branch guard confirmed `main`.
- PASS - Runtime startup loads only `.env`: `npm run dev:local-api` reported `.env loaded for API runtime (4 key(s) applied).`
- PASS - Runtime does not auto-load `.env.local`, `.env.uat`, or `.env.prod`: with `.env` temporarily absent, `npm run dev:local-api` reported `.env was not found for API runtime.`
- PASS - Tests/validation explicitly load `.env.local` only where allowed: `npm run validate:supabase-dev` reported `Explicit .env.local DEV validation load`.
- PASS - Active runtime/database config uses `GAMEFOUNDRY_DATABASE_URL`; active runtime search found the key in startup, validation, DDL apply, and runtime auth contract code.
- PASS - Retired active runtime dependencies are absent from startup/runtime code: `GAMEFOUNDRY_AUTH_PROVIDER`, `GAMEFOUNDRY_DB_PROVIDER`, and `GAMEFOUNDRY_SUPABASE_DATABASE_URL` appear only in the environment-agnostic validation gate's rejection patterns.
- PASS - `.env.local` and `.env.uat` exist as ignored local files with required keys and no forbidden keys. Values were not printed.
- PASS - `.env` and `.env.*` remain ignored, with safe examples trackable through `.env.example`.
- PASS - Game Workspace active-game handling no longer uses raw malformed payloads in action handlers; delete, purpose, status, and role updates now normalize active-game responses before reading fields.
- PASS - Game Workspace create flow works through the targeted Playwright lane.
- PASS - Malformed successful `getActiveGame` payloads now show visible diagnostics without browser throw.
- PASS - No DEV/UAT/PROD branching across active app/server/API/DB code according to `npm run validate:browser-env-agnostic`.
- PASS - No local-db/mock-db/SQLite fallback introduced.
- PASS - No silent fallback introduced; malformed active-game payloads show actionable status text.

## Env Loading Evidence
- PASS - `.env` present:
  - `GameFoundry API runtime server running at http://127.0.0.1:5594/account/sign-in.html`
  - `.env loaded for API runtime (4 key(s) applied).`
  - `Configured auth connection: configured.`
  - `Configured database connection: configured.`
- PASS - `.env` temporarily absent while `.env.local` still existed:
  - `GameFoundry API runtime server running at http://127.0.0.1:5595/account/sign-in.html`
  - `.env was not found for API runtime.`
  - `Configured auth connection: missing GAMEFOUNDRY_SUPABASE_URL, GAMEFOUNDRY_SUPABASE_ANON_KEY.`
  - `Configured database connection: missing GAMEFOUNDRY_SUPABASE_URL, GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY, GAMEFOUNDRY_DATABASE_URL.`

## GAMEFOUNDRY_DATABASE_URL Evidence
- PASS - `.env.example` contains `GAMEFOUNDRY_DATABASE_URL=`.
- PASS - `scripts/start-local-api-server.mjs` requires `GAMEFOUNDRY_DATABASE_URL` for the configured database connection.
- PASS - `scripts/validate-supabase-dev.mjs` validates `GAMEFOUNDRY_DATABASE_URL`.
- PASS - `scripts/apply-supabase-dev-ddl.mjs` reads `GAMEFOUNDRY_DATABASE_URL`.
- PASS - `src/dev-runtime/auth/provider-contract-stubs.mjs` reports database readiness using `GAMEFOUNDRY_DATABASE_URL`.

## Game Workspace Create Evidence
- PASS - Targeted Playwright: `Game Workspace creates, opens, and deletes mock games`.
- PASS - Targeted Playwright: `Game Workspace shows active-game API diagnostics without throwing`.
- PASS - Targeted Playwright: `Game Workspace reports malformed active-game payloads without throwing`.
- PASS - Result: `3 passed`.

## Validation Lane Report
- PASS - `node --check toolbox/game-workspace/game-workspace.js`
- PASS - `node --check tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`
- PASS - `node --check scripts/start-local-api-server.mjs`
- PASS - `node --check scripts/validate-supabase-dev.mjs`
- PASS - `npm run validate:supabase-dev`
  - WARN noted by validator: direct database socket TLS self-signed certificate advisory; REST/API identity readiness passed.
- PASS - `npm run dev:local-api` runtime proof with `.env` present and `.env` absent.
- PASS - `npx playwright test tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs --grep "Game Workspace creates, opens, and deletes mock games|Game Workspace shows active-game API diagnostics without throwing|Game Workspace reports malformed active-game payloads without throwing" --workers=1 --reporter=list`
- PASS - `npm run validate:browser-env-agnostic`
- SKIP - Full samples smoke was not run because samples were not in this PR scope.

## Manual Validation Notes
- Confirmed local ignored `.env`, `.env.local`, and `.env.uat` contain required key names and no forbidden provider/old database key names without exposing values.
- Confirmed runtime output does not mention `.env.local`, `.env.uat`, `.env.prod`, provider selection, or local DB selection.
- Confirmed Playwright-generated `tmp/test-results` was removed after validation; the final repo `tmp` artifact for this BUILD is the delta ZIP only.

## Playwright V8 Coverage
- PASS - Runtime JS coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- PASS - Changed runtime JS `toolbox/game-workspace/game-workspace.js` was covered at 89% function coverage in the generated report.
