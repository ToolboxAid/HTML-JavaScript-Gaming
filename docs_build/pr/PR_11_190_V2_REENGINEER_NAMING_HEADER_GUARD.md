# PR_11_190 — V2 Re-engineer Naming + Header Guard

## Purpose

Lock the Tool V2 migration lane so Codex cannot drift into legacy copy/paste, ambiguous tool naming, or custom header implementations.

This PR is corrective enforcement for the current V2 lane:

- Palette Manager V2
- SVG Asset Studio V2
- Future Vector Map Editor V2
- Future Tilemap Studio V2
- Future Asset Browser V2

## Non-negotiable Direction

This is a re-engineer.

This is not:
- a copy/paste of v1 tools
- a patch of legacy tools
- a wrapper around Workspace Manager v1
- a platformShell migration
- a shared/tools integration task

## Required Naming Rule

Every new Tool V2 visible name must end with `V2`.

Correct names:

- Palette Manager V2
- SVG Asset Studio V2
- Vector Map Editor V2
- Tilemap Studio V2
- Asset Browser V2

Ambiguous names are not allowed for V2 tools:

- Palette Manager
- Palette Browser
- SVG Asset Studio
- Vector Map Editor
- Tilemap Studio
- Asset Browser

## Palette Naming Clarification

Use:

```text
Palette Manager V2
```

Do not introduce or reuse:

```text
Palette Browser
Palette Browser V2
Palette Manager
```

Unless the repo already contains a distinct v1 route named Palette Browser, leave it untouched. The active V2 lane is `Palette Manager V2`.

## Header Requirement

Every V2 tool must use the same shared theme header mount used by `/index.html`:

```html
<div id="shared-theme-header"></div>
```

Codex must re-engineer the V2 tool shell to use that mount.

Codex must not:
- create a new custom header
- copy/paste old header markup from v1 tools
- use `platformShell`
- use `tools/shared/*`
- create a fallback header
- silently hide missing header state

If the shared theme/header cannot mount, the tool must show an explicit visible error state.

## Architecture Boundary

Data entry paths only:

1. Workspace writes session, tool reads session.
2. Tool URL writes session, tool reads session.
3. Tool direct reads session via `hostContextId`.

Tool never:
- fetches data
- guesses data
- uses fallback data
- reaches into Workspace Manager v1
- relies on legacy aliases

## Scope

Allowed:
- Update V2 tool visible names to end with `V2`.
- Update V2 document titles, headings, aria labels, and menu labels to end with `V2`.
- Ensure Palette Manager V2 and SVG Asset Studio V2 use `#shared-theme-header`.
- Add explicit visible error if required session context/header data is missing.
- Keep implementation in the V2 tool file only unless an existing V2 entry file already owns the header mount.

Not allowed:
- No schema changes.
- No sample changes.
- No game changes.
- No Workspace Manager v1 changes.
- No legacy tool patching.
- No repo-wide fallback cleanup.
- No helper classes.
- No abstraction layers.
- No alias variables.
- No copy/paste from v1 tools.

## Validation

Run targeted validation only.

Required checks:

```powershell
node --check tools/palette-manager-v2/index.js
node --check tools/svg-asset-studio-v2/index.js
```

If those exact files do not exist, Codex must locate the current V2 entry files by path/name and run `node --check` on the changed V2 entry files only.

Manual verification:

- Palette Manager V2 title/header shows `Palette Manager V2`.
- SVG Asset Studio V2 title/header shows `SVG Asset Studio V2`.
- Both tools contain and mount through `<div id="shared-theme-header"></div>`.
- No `platformShell` dependency is introduced.
- No `tools/shared/*` dependency is introduced.
- Empty/error states are visible and actionable.
- No fallback/default data is used.

Full samples smoke test:

Skipped. This PR targets V2 tool naming/header compliance only and does not change shared sample loader/framework.
