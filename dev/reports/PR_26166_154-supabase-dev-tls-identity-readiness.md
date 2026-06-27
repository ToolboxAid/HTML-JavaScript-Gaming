# PR_26166_154-supabase-dev-tls-identity-readiness

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before implementation.
- PASS: Created standalone Supabase DEV validation script at `scripts/validate-supabase-dev.mjs`.
- PASS: Added `npm run validate:supabase-dev`.
- PASS: Script loads `.env.local` without printing secret values.
- PASS: Script checks required variables:
  - `GAMEFOUNDRY_SUPABASE_URL`
  - `GAMEFOUNDRY_SUPABASE_ANON_KEY`
  - `GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY`
  - `GAMEFOUNDRY_SUPABASE_DATABASE_URL`
- PASS: Script masks configured values using first 6 and last 4 characters only.
- PASS: Script checks Supabase URL reachability.
- PASS: Script checks Supabase Auth endpoint reachability.
- PASS: Script checks service role authentication through Supabase Auth admin API.
- PASS: Script checks TLS certificate validation without disabling TLS verification.
- PASS: Script checks the database URL through a TLS PostgreSQL connection handshake.
- PASS: Script checks `users`, `roles`, and `user_roles` table existence through server-side service role REST access.
- PASS: Script outputs clear `PASS`/`FAIL` diagnostics and `Overall Result`.
- PASS: No `NODE_TLS_REJECT_UNAUTHORIZED=0` usage was added.
- PASS: No `rejectUnauthorized: false` usage was added.
- PASS: No secrets or `.env.local` files were committed or modified.

## Validation Lane Report
- Impacted lane: targeted operator auth/provider validation tooling.
- Playwright impacted: No. This PR adds standalone validation tooling and an npm script only.
- Samples validation: SKIP. No sample files, sample manifests, or sample runtime behavior changed.

## Validation Performed
- PASS: `node --check scripts/validate-supabase-dev.mjs`
- PASS: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`
- PASS: TLS bypass guard search found no matches for `NODE_TLS_REJECT_UNAUTHORIZED`, `rejectUnauthorized: false`, or `strictSSL=false`.
- PASS: `git diff --check`
- FAIL: `npm run validate:supabase-dev` completed with expected diagnostic failure because this machine does not trust the current Supabase TLS certificate chain.

## validate:supabase-dev Output

```text
> html-javascript-gaming@1.0.0 validate:supabase-dev
> node ./scripts/validate-supabase-dev.mjs

PASS - .env.local loaded (6 key(s) loaded)
PASS - URL configured (GAMEFOUNDRY_SUPABASE_URL=https:.../v1/)
PASS - Publishable key configured (GAMEFOUNDRY_SUPABASE_ANON_KEY=sb_pub...V2Zj)
PASS - Service role key configured (GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY=sb_sec...KRU6)
PASS - Database URL configured (GAMEFOUNDRY_SUPABASE_DATABASE_URL=postgr...gres)
FAIL - Supabase reachable (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
FAIL - TLS validation (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
FAIL - Auth endpoint reachable (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
FAIL - Service role authentication (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
FAIL - Database connection (SELF_SIGNED_CERT_IN_CHAIN)
FAIL - users table (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
FAIL - roles table (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
FAIL - user_roles table (UNABLE_TO_VERIFY_LEAF_SIGNATURE)

Overall Result: FAIL
Failed checks: Supabase reachable, TLS validation, Auth endpoint reachable, Service role authentication, Database connection, users table, roles table, user_roles table
```

## Manual Validation Notes
- `.env.local` was detected and loaded by the script.
- Required Supabase values were present and masked in output.
- The validator did not print raw secrets.
- TLS verification remains enabled for HTTPS and PostgreSQL checks.
- Current failure is environment trust related:
  - HTTPS/Supabase REST/Auth: `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
  - PostgreSQL TLS: `SELF_SIGNED_CERT_IN_CHAIN`
- The script correctly refuses to treat these connections as valid rather than disabling TLS or falling back.

## Changed Files
- `package.json`
- `scripts/validate-supabase-dev.mjs`
- `docs_build/dev/reports/PR_26166_154-supabase-dev-tls-identity-readiness.md`

## Review Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
