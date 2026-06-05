# Tool Navigation Targeted MSJ Tests

PR: PR_26155_099-tool-navigation-targeted-msj-tests

## Summary

- Added `npm run test:lane:tool-navigation`.
- Registered the `tool-navigation` lane in `scripts/run-targeted-test-lanes.mjs`.
- Added `tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`.
- The lane covers Admin Tools Progress links, route-less planned rendering, Tool Display Mode previous/next controls, Game Design previous/next, multi-path fallback, role preservation, direct Group view routing, and console/page errors.

## Validation Results

- PASS: `node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- PASS: `npm run test:lane:tools-progress`
- PASS: `npm run test:lane:tool-navigation`
  - 5 tests passed.
- PASS: `npm run test:workspace-v2`
  - Legacy command name; user-facing naming remains Project Workspace.
- PASS: `git diff --check`

## Concurrent Run Note

The first attempt ran `tools-progress` and `tool-navigation` concurrently. Tools Progress passed, but Tool Navigation hit a Playwright artifact race:

`ENOENT: no such file or directory ... .playwright-artifacts-0/...zip`

The same `tool-navigation` lane was rerun by itself and passed cleanly with 5/5 tests.

## Targeted Checks Covered

- `admin/tools-progress.html`
- `toolbox/project-workspace/index.html`
- `toolbox/game-design/index.html`
- `toolbox/game-configuration/index.html`
- `toolbox/index.html?view=group&group=design`

## Skipped Lanes

- `game-design`: skipped because Game Design save/update/validation behavior was unchanged.
- `game-configuration`: skipped because configuration repository, handoff, validation, and output behavior were unchanged.
- `project-workspace`: skipped because project repository and project lifecycle behavior were unchanged.
- `build-path`: skipped because Project Build Path table behavior was not changed.
- `engine-src`: skipped because no engine or shared `src/` runtime code changed.
- `samples`: skipped because samples are out of scope and no sample assets or manifests changed.

Full suite is required only when shared runtime, shared parser, shared DB, shared Theme V2, or cross-tool integration behavior changes beyond the targeted navigation surfaces.
