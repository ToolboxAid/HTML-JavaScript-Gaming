# Canonical Repository Structure

## Purpose

Establish the canonical repository structure for future development and reduce technical debt.

## Canonical Structure

Valid top-level folders:
- account/
- admin/
- assets/
- community/
- company/
- deploy/
- dev/
- docs/
- games/
- learn/
- legal/
- marketplace/
- memberships/
- owner/
- src/
- toolbox/

Root product and repo sections:
- account/, admin/, community/, company/, learn/, legal/, marketplace/, memberships/, and owner/ are production website sections.
- assets/ contains production website and tool assets.
- docs/ is production Docs & Help content.
- games/ is public game discovery.
- toolbox/ is the Creator toolbox/workspace.
- deploy/ contains deployment configuration.
- dev/ contains the development workspace.
- src/ contains deployable application/runtime/API source.

Deployable application source:
- src/web/{feature-name}/
- src/api-runtime/{feature-name}/
- src/runtime/{feature-name}/

Final src layer ownership:
- src/web/ owns browser-facing deployable application modules used by public pages, account/admin surfaces, and Creator tools.
- src/api-runtime/ owns deployable API/runtime service modules that back the shared Browser -> API -> Postgres/R2 contract.
- src/runtime/ owns deployable game, tool, engine, and shared runtime capabilities.
- Existing top-level src/advanced/, src/api/, src/dev-runtime/, src/engine/, src/shared/, and src/tools/ directories are legacy transition buckets until explicit migration PRs move them.
- Do not add new top-level src/ layer names outside src/web/, src/api-runtime/, or src/runtime/ without OWNER approval.
- Do not use team names in runtime source filenames.

Valid dev workspace folders:
- dev/archive/
- dev/build/
- dev/config/
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
- dev/reports/ owns active and historical generated reports. Report files under `dev/reports/` are authoritative tracked repository source and must not be deleted only to make the worktree clean.
- dev/scripts/ owns development-only scripts and runners.
- dev/templates/ owns reusable development templates.
- dev/tests/ owns non-deployable test suites.
- dev/tools/ owns development-only tooling.
- dev/workspace/ owns generated output: tmp, zips, logs, generated files, and test-results.

Tools:
- toolbox/{tool-name}/index.html

Tool assets:
- assets/toolbox/{tool-name}/js/index.js
- assets/toolbox/{tool-name}/css/index.css

Themes:
- assets/theme-v1/
- assets/theme-v2/

Shared JavaScript:
- assets/js/shared/

Legacy transition buckets:
- src/advanced/
- src/api/
- src/dev-runtime/
- src/engine/
- src/shared/
- src/tools/

These legacy transition buckets may remain until explicit migration PRs move them into `src/web/`, `src/api-runtime/`, or `src/runtime/`.

## Rules

- Root is production website and standard repository configuration only.
- src/ is deployable application/runtime/API code.
- dev/ is development workspace only.
- deploy/ is deployment configuration.
- docs/ is production Docs & Help content.
- Theme first.
- Tool CSS second.
- Shared functionality belongs in assets/js/shared/.
- No new scattered JS folders.
- No new scattered CSS folders.
- Do not create new folders unless they fit the documented canonical structure.
- If a requested or generated path does not clearly fit the canonical structure, Codex must HARD STOP and report the proposed path.
- New development follows the canonical structure.
- New deployable `src/` work follows `src/web/`, `src/api-runtime/`, or `src/runtime/`.
- New non-deployable work belongs under `dev/`.
- Required reports belong under flat tracked `dev/reports/`.
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
