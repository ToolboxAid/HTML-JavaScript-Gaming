# Level 10.5 Hardcoded Asset Path Audit

## Scope
- Active first-class tools from `tools/toolRegistry.js` (`getActiveToolRegistry()`).
- Runtime source files under each active tool folder (`tools/<tool>/**/*.js|*.mjs`).

## Audit Method
- Static scan for hardcoded JSON asset path coupling:
  - `workspace.asset-catalog.json`
  - hardcoded `/assets/*.json` literals
  - hardcoded sample/demo JSON fetches
  - legacy `searchParams.get("game")` fallback usage

## Findings Before Fix
- `tools/Asset Browser/main.js`
  - Derived catalog paths from `gameHref`, `gameId`, and inferred `/games/<id>/assets/workspace.asset-catalog.json`.
- `tools/Asset Pipeline Tool/main.js`
  - Built fallback candidate paths including:
    - `/games/<normalizedGameId>/assets/workspace.asset-catalog.json`
    - `/games/<gameId>/assets/workspace.asset-catalog.json`
- `tools/Skin Editor/main.js`
  - Derived catalog path using hardcoded `/assets/workspace.asset-catalog.json`.
  - Accepted legacy query fallback `gameId || game`.

## Fix Applied
- `tools/Asset Browser/main.js`
  - Removed hardcoded catalog filename/path derivation helpers.
  - Catalog loading now accepts explicit JSON catalog paths only (query/manifest/handoff fields).
- `tools/Asset Pipeline Tool/main.js`
  - Removed hardcoded catalog path candidate derivation from game id/href.
  - Catalog loading now accepts explicit JSON catalog paths only (query/manifest fields).
- `tools/Skin Editor/main.js`
  - Removed hardcoded catalog path derivation helper.
  - Removed `searchParams.get("game")` fallback in preset query parsing.

## Post-Fix Result
- `workspace.asset-catalog.json` literals in active first-class tool runtime files: `0`
- hardcoded `/assets/*.json` literals in active first-class tool runtime files: `0`
- hardcoded sample/demo JSON fetch literals in active first-class tool runtime files: `0`
- legacy `searchParams.get("game")` fallback usage in active first-class tool runtime files: `0`

## Verification Command
- `node -e <active-tool static audit>` (repo-local script execution)
  - `workspace.asset-catalog.json: 0`
  - `hardcoded /assets/*.json literal: 0`
  - `hardcoded sample/demo json fetch: 0`
  - `legacy game query fallback: 0`

## Notes
- Explicit manifest file loading remains allowed by policy.
