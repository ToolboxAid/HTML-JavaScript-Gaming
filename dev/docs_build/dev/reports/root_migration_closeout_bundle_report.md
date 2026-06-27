# PR_26154_017 Root Migration Closeout Bundle Report

Task: `PR_26154_017-root-migration-closeout-bundle`

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Closed out active path references for the root migration.
- Verified current active/deprecated structure ownership.
- Normalized remaining active references to deprecated root `samples/` paths where the intended path was clearly `archive/v1-v2/samples/`.
- Did not modify `archive/v1-v2/tools/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/`, or `start_of_day/`.
- Did not rebuild tools or add feature work.

## Changes

| File | Change |
| --- | --- |
| `scripts/PS/audit-sample-json-js-references.ps1` | Default sample root and comment now use `archive/v1-v2/samples`. |
| `scripts/PS/audit-samples-only-palette-json.ps1` | Help text and default sample root now use `archive/v1-v2/samples`. |
| `scripts/audit-sample-json-ownership.mjs` | Sample root, metadata path, report path, regexes, and report text now use `archive/v1-v2/samples` and `docs_build/dev/reports`. |
| `scripts/engine_usage_audit.py` | Sample bucket detection now uses `archive/v1-v2/samples`. |
| `scripts/run-targeted-test-lanes.mjs` | Removed the obsolete active `samples/` lane check while keeping `archive/v1-v2/samples/` and `tests/samples/`. |
| `toolbox/dev/checkInternalBarrelGuard.mjs` | Sample entrypoint pattern now uses `archive/v1-v2/samples`. |
| `toolbox/shared/preview/generate-list-previews.html` | Preview input parser now recognizes `archive/v1-v2/samples/phase...` paths. |
| `toolbox/schemas/README.md` | Removed an ambiguous trailing slash from the schema `samples` layout label; the actual schema path is unchanged. |

## Active Path Closeout

Targeted active-path validation found no active references to:

- `GameFoundryStudio/`
- `src/engine/theme/`
- `assets/theme/v1/`
- `favicon.ico`
- deprecated root `samples/`

The scan excluded `docs_build/`, tests, reports, `archive/v1-v2/tools/`, `archive/v1-v2/games/`, `archive/v1-v2/samples/`, `start_of_day/`, and `tmp/` so historical records and deprecated references remain preserved.

## Structure Confirmation

| Area | Status |
| --- | --- |
| `/docs/` | User-facing documentation only: `index.html`, `faq.html`, `reference.html`, `support.html`, and `README.md`. |
| `/docs_build/` | Build, dev, PR, reports, schema docs, design/reference/release/tool docs, and workflow content. |
| `/toolbox/` | Active tool surfaces use `toolbox/[toolname]/index.html`; support folders remain under `toolbox/dev`, `toolbox/shared`, and `toolbox/schemas`. |
| `/archive/v1-v2/tools/` | Deprecated tools live under `archive/v1-v2/tools/`. |
| `/games/` | Active game category pages live under `games/`; `games/index.html` exists and links to game-type tiles. |
| `/archive/v1-v2/games/` | Deprecated playable games live under `archive/v1-v2/games/`. |
| `/archive/v1-v2/samples/` | Deprecated samples live under `archive/v1-v2/samples/`. |
| `/favicon.svg` | Canonical active site icon; `/favicon.ico` is absent. |
| `LICENSE` | Proprietary/restrictive license notice is present. |

## Games And Tools

- PASS: `games/index.html` exists.
- PASS: `games/index.html` exposes 7 game-type tiles and every tile href/image resolves.
- PASS: `toolbox/index.html` loads the active accordion data source.
- PASS: Tool groups are alphabetically sorted: AI, Assets, Audio, Colors, Input, Objects, Worlds.
- PASS: Tool tiles inside every group are alphabetically sorted by visible tool name.
- PASS: 19 active tool href/image references resolve.

## Cleanup

- `GameFoundryStudio/`, `samples/`, `assets/theme/v1/`, `src/engine/theme/`, and `favicon.ico` are absent.
- No empty tracked legacy folders remained to delete.
- Deprecated `archive/v1-v2/tools/`, `archive/v1-v2/games/`, and `archive/v1-v2/samples/` were not modified.

## Validation

- PASS: Targeted active-path reference validation.
- PASS: Canonical favicon validation.
- PASS: LICENSE proprietary/restrictive validation.
- PASS: Games index tile link/image validation.
- PASS: Tools index alphabetical ordering validation.
- PASS: Static validation for changed HTML, JS, CSS, JSON, Markdown, plus touched PowerShell/Python scripts.
- PASS: `git diff --check`.
- PASS: `git status --short -- start_of_day archive/v1-v2/tools archive/v1-v2/games archive/v1-v2/samples` returned no output.
- SKIPPED: `npm run test:workspace-v2`; active Workspace V2 launch/navigation behavior was not changed.
- SKIPPED: old tools, old games, old samples, and full samples smoke tests per request.
