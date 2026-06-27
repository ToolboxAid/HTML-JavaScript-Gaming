# Canonical Repository Structure

## Purpose

Establish the canonical repository structure for future development and reduce technical debt.

## Canonical Structure

Root product sections:
- docs/
- games/
- toolbox/
- account/
- admin/
- legal/
- assets/

Deployable application source:
- src/web/{feature-name}/
- src/api-runtime/{feature-name}/
- src/runtime/{feature-name}/

Development workspace:
- dev/build/
- dev/reports/
- dev/tests/
- dev/scripts/
- dev/config/
- dev/archive/
- dev/workspace/

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

- Theme first.
- Tool CSS second.
- Shared functionality belongs in assets/js/shared/.
- No new scattered JS folders.
- No new scattered CSS folders.
- New development follows the canonical structure.
- New deployable `src/` work follows `src/web/`, `src/api-runtime/`, or `src/runtime/`.
- New non-deployable work belongs under `dev/`.
- Required reports belong under flat `dev/reports/`.
- Required ZIPs belong under `dev/workspace/zips/`; generated temporary artifacts belong under `dev/workspace/tmp/`.
