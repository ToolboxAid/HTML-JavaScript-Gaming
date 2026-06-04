# BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_2

## PR Purpose
Extract and normalize shared event/command helpers plus safe UI utilities with minimal changes and reuse of `toolbox/shared` first.

## Scope
- Extract shared event + command helpers.
- Extract safe UI utilities.
- Reuse `src/shared/toolbox/*` before introducing new local helpers.
- Minimal changes only.
- No theme work.
- No editor-state extraction.

## Exact Target Files
- `src/shared/toolbox/platformShell.js`
- `src/shared/toolbox/eventCommandUtils.js`
- `src/shared/toolbox/uiSafeUtils.js`

## Validation
- Run: `npm run test:launch-smoke -- --tools`
- Report files changed.

## Required Output
- ZIP: `tmp/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_2_delta.zip`
- Reports under `docs_build/dev/reports/`
