# Tools Progress Tool Links

PR: PR_26155_096-tools-progress-tool-links

## Summary

- `admin/tools-progress.html` remains hydrated by `admin/tools-progress.js`.
- Tool names now render as links when shared registry route data provides an `entryPoint`.
- Route generation is centralized in `toolbox/toolRegistry.js` through `getToolRoute(tool)`.
- Route-less tools render as text with a `Planned - Route pending` pill instead of a broken link.
- No routes were hardcoded in `admin/tools-progress.js`.

## Files

- `toolbox/toolRegistry.js`
- `admin/tools-progress.js`
- `tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`

## Evidence

- Admin Tools Progress rows still hydrate from `getActiveToolRegistry()`.
- The new test verifies every active registry tool with route data renders a matching link.
- The route-less rendering path is covered with a route-less fixture through the exported row renderer.

## Validation

- PASS: `npm run test:lane:tools-progress`
- PASS: `npm run test:lane:tool-navigation`
- PASS: `npm run test:workspace-v2`
- PASS: `git diff --check`

`npm run test:workspace-v2` is a legacy command name. User-facing naming remains Project Workspace.

## Manual Test Notes

1. Open `admin/tools-progress.html`.
2. Confirm each routed tool name is clickable.
3. Confirm the links use `toolbox/<tool>/index.html` routes from the registry.
4. Confirm route-less tools would show text with `Planned - Route pending` rather than a broken link.

## Validation Scope

Impacted lanes:
- `tools-progress`
- `tool-navigation`
- `workspace-contract` through the legacy `npm run test:workspace-v2` command because shared route/navigation wiring changed.

Skipped lanes:
- `game-design`, `game-configuration`, and `project-workspace` runtime lanes were skipped because no mock repository, save/update, validation, or project data behavior changed.
- `engine-src`, `samples`, and archive lanes were skipped because this PR does not touch engine runtime, sample JSON, or archived reference material.
