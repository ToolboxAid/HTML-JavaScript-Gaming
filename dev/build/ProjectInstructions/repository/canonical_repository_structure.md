# Canonical Repository Structure

## Purpose

Establish the canonical repository structure for future development and reduce technical debt.

## Canonical Structure

Valid top-level folders:
- api/
- deploy/
- dev/
- src/
- www/

Root product and repo sections:
- www/ owns browser-served production website sections, Creator toolbox pages, public game discovery, production Docs & Help, and browser assets.
- api/ is the Node/API/server application surface for server entry points, API routing, API services, database access, storage access, auth, setup, publishing, and admin server logic.
- deploy/ contains deployment configuration.
- dev/ contains the development workspace.
- src/ contains deployable application/runtime/API source.
- repository root contains standard repository configuration and top-level application shells only.

Deployable application source:
- src/web/{feature-name}/
- src/api-runtime/{feature-name}/
- src/runtime/{feature-name}/

Final src layer ownership:
- src/web/ owns browser-facing deployable application modules used by public pages, account/admin surfaces, and Creator tools.
- src/api-runtime/ owns deployable API/runtime service modules that back the shared Browser -> API -> Postgres/R2 contract.
- src/runtime/ owns deployable game, tool, engine, and shared runtime capabilities.
- Existing top-level src/advanced/, src/api/, src/engine/, src/shared/, and src/tools/ directories are legacy transition buckets until explicit migration PRs move them.
- Browser API clients remain outside `api/`; browser-served code must use API/service contracts instead of importing top-level `api/` files directly.
- `src/dev-runtime/admin/` remains only as a legacy Admin Notes browser-viewer compatibility path until a scoped browser admin migration retires it.
- Do not add new top-level src/ layer names outside src/web/, src/api-runtime/, or src/runtime/ without OWNER approval.
- Do not use team names in runtime source filenames.

Valid dev workspace folders:
- dev/archive/
- dev/build/
- dev/config/
- dev/local-runtime/
- dev/reports/
- dev/scripts/
- dev/templates/
- dev/tests/
- dev/tools/
- dev/workspace/

Dev workspace ownership:
- dev/archive/ owns historical reference material only.
- dev/build/ owns active Project Instructions, architecture, database DDL/DML/seed docs, standards, backlog, PR planning, and governance.
- dev/config/ owns development-only runner and tooling configuration.
- dev/local-runtime/ owns developer-only local runtime bootstrap, team port resolution, local diagnostics, and browser launch orchestration.
- dev/reports/ owns authoritative Codex reports for the repository. Reports committed to `main` are the official record.
- dev/scripts/ owns development-only scripts and runners.
- dev/templates/ owns reusable development templates.
- dev/tests/ owns non-deployable test suites.
- dev/tools/ owns development-only tooling.
- dev/workspace/ owns generated output: tmp, zips, logs, generated files, and test-results.

Browser-served tools:
- www/toolbox/{tool-name}/index.html

Browser-served tool assets:
- www/assets/toolbox/{tool-name}/js/index.js
- www/assets/toolbox/{tool-name}/css/index.css

Themes:
- www/assets/theme-v1/
- www/assets/theme-v2/

Shared JavaScript:
- www/assets/js/shared/

Legacy transition buckets:
- src/advanced/
- src/api/
- src/engine/
- src/shared/
- src/tools/
- src/dev-runtime/admin/

These legacy transition buckets may remain until explicit migration PRs move them into `src/web/`, `src/api-runtime/`, or `src/runtime/`.

## Rules

- Root is standard repository configuration and top-level application shells only.
- www/ is the browser-served application surface.
- api/ is the Node/API/server application surface.
- Browser-served code must not import top-level `api/` files directly.
- src/ is deployable application/runtime/API code.
- dev/ is development workspace only.
- deploy/ is deployment configuration.
- docs/ routes are served from `www/docs/`.
- Theme first.
- Tool CSS second.
- Browser-served shared functionality belongs in `www/assets/js/shared/`.
- No new scattered JS folders.
- No new scattered CSS folders.
- Do not create new folders unless they fit the documented canonical structure.
- If a requested or generated path does not clearly fit the canonical structure, Codex must HARD STOP and report the proposed path.
- New development follows the canonical structure.
- New deployable `src/` work follows `src/web/`, `src/api-runtime/`, or `src/runtime/`.
- New non-deployable work belongs under `dev/`.
- Required reports belong under flat `dev/reports/`.
- Required ZIPs belong under `dev/workspace/zips/`; generated temporary artifacts belong under `dev/workspace/tmp/`.

## Creator Data Boundary

- Creator data must not write to repository folders.
- Creator metadata must go through the API to Postgres.
- Creator assets must go through the API to Cloudflare R2.
- Repo folders may contain fixtures, templates, governance, and development artifacts only when they are not Creator-owned production data.

## Environment And Runtime Rules

- Postgres is the only active runtime database.
- The same application code path must run across LOCAL, DEV, IST, UAT, and PROD.
- Environment differences must come from `.env` values or environment-managed secrets.
- Runtime source filenames must not use team names.

## Environment File Placement

- Local `.env` may exist at repository root for developer startup only.
- Root `.env` is user/environment-owned, ignored, and never deployed as part of `www/` or `api/`.
- Production uses deployment environment variables and environment-managed secrets instead of committed `.env` files.
- `www/` must never contain secrets or environment-owned `.env` files.
- `api/` reads environment values from `process.env` and the deployment environment.
- Only `.env.example` is tracked as a repository template.

## PR Chain Boundary

The development workspace restructure must proceed through sequential scoped PRs. A PR may only move or update the paths named in its purpose.

Final path-governance PRs may document target paths and legacy exceptions, but they must not move deployable application code unless explicitly scoped.

## Invalid Legacy Paths

These paths are not active repository ownership locations:

- docs_build/
- tmp/
- projects/
- scripts/
- tests/
- archive/
- project-instructions/
- dev/docs_build/
- dev/project-instructions/
- dev/workspace/artifacts/
- dev/build/dev/

References to invalid legacy paths are allowed only as historical/reference notes, explicit migration notes, ignore rules, or audit evidence. Active commands, active templates, Project Instructions, validation scripts, and new Codex output must use the canonical folders above.
