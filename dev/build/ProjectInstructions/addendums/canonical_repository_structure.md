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
- dev/reports/ owns active and historical generated reports.
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
- Required reports belong under flat `dev/reports/`.
- Required ZIPs belong under `dev/workspace/zips/`; generated temporary artifacts belong under `dev/workspace/tmp/`.

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
