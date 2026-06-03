# PR_26132_001-add-world-object-vector-studios

## Purpose

Add World Vector Studio V2 and Object Vector Studio V2 as copied First-Class Tool V2 starter surfaces while keeping Primitive Skin Editor and Vector Map Editor intact.

## Changes

- Copied `toolbox/templates-v2/` into `toolbox/world-vector-studio-v2/`.
- Copied `toolbox/templates-v2/` into `toolbox/object-vector-studio-v2/`.
- Updated copied tool ids, visible titles, headers, README documentation, and copied launch checks.
- Registered both new tools in `toolbox/toolRegistry.js` for registry-driven tools index launch wiring.
- Marked Vector Map Editor and Primitive Skin Editor as deprecated in tool tiles and their existing documentation only.
- Added How To Use pages for the two new studio tools.
- Added Workspace Manager V2 Playwright coverage for tools index cards, launch definitions, and direct launch of both copied tool shells.

## Validation

- `npm run test:workspace-v2` passed: 38 tests.
- Full samples smoke test was not run per BUILD scope.
