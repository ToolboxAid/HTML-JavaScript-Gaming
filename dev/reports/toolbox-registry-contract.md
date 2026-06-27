# Toolbox Registry Contract

PR: `PR_26155_006-toolbox-registry-contract`

## Scope
- This PR is contract-only.
- Current `toolbox/tools-page-accordions.js` rendering remains unchanged.
- No runtime behavior was modified.
- No CSS was added.
- No tools were added.
- No database implementation was added.

## Purpose
Define the minimal Toolbox registry contract needed before replacing the transitional `toolbox/tools-page-accordions.js` rendering path.

The registry must support the same Toolbox page modes:
- Order
- Group
- Progress
- Build Path

## Minimal Registry Entry

Each active Toolbox tool entry must provide:

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `id` | string | Yes | Stable machine-readable tool identifier. Must be unique and should not change when the user-facing label changes. |
| `label` | string | Yes | User-facing tool name used for visible tiles, navigation, and alphabetical ordering. |
| `category` | string | Yes | User-facing group name used by Group mode. |
| `colorGroup` | string | Yes | Theme V2 color/group token key used to select approved visual grouping classes or swatches. |
| `route` | string | Yes | Active route to the tool page, expected to resolve under `/toolbox/[toolname]/`. |
| `requiredForPlayable` | boolean | Yes | Marks tools required before a game can be promoted to playable/public release. |
| `requires` | string[] | Yes | Ordered list of other registry `id` values that this tool depends on or should follow. Empty array when there are no prerequisites. |
| `deferred` | boolean | Yes | Marks tools that are intentionally listed but not ready for active completion. Deferred tools may still appear in planning views. |
| `progressChecklist` | object[] | Yes | Static checklist items used by Progress mode to explain readiness. Empty array only when no progress checklist is known yet. |
| `status` | string | Yes | Current readiness state used by Progress mode. |

## Status Values

Allowed `status` values:
- `locked`
- `ready`
- `in-progress`
- `complete`

Rules:
- `locked` means the tool is not ready for active use or depends on unfinished prerequisites.
- `ready` means the tool is available to use but has not been completed for the current project path.
- `in-progress` means work has started but the checklist is not complete.
- `complete` means the required checklist is complete for the current project path.

## Progress Checklist Items

Each `progressChecklist` item should provide:

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `id` | string | Yes | Stable checklist item identifier scoped to the tool entry. |
| `label` | string | Yes | User-facing checklist item text. |
| `complete` | boolean | Yes | Static readiness flag for Progress mode until runtime project state exists. |
| `requiredForPlayable` | boolean | Yes | Marks checklist items that block playable/public release. |

No persisted runtime project state is introduced by this contract. Future runtime behavior must define its state source separately.

## Mode Support

### Order
- Sort registry entries by `label`.
- Use `id` as the stable identity.
- Use `route` for tile links.

### Group
- Group registry entries by `category`.
- Use `colorGroup` to select existing approved Theme V2 grouping styles.
- Do not derive grouping from folder names once registry-driven rendering exists.

### Progress
- Use `status` for the top-level readiness label.
- Use `progressChecklist` for static checklist rows or readiness summaries.
- Use `requiredForPlayable` on tools and checklist items to indicate playable/public blockers.
- Use `deferred` to mark entries that should remain visible but not treated as active completion blockers.

### Build Path
- Use `requiredForPlayable` to identify core playable-release path items.
- Use `requires` to establish dependency ordering.
- Use `deferred` to place non-blocking future tools outside the required path.
- Use `category` and `colorGroup` only for display grouping, not as dependency truth.

## Contract Guardrails
- The registry is the data source contract only.
- This PR does not create a database.
- This PR does not add persistence.
- This PR does not add runtime state, project state, `localStorage`, or `sessionStorage`.
- This PR does not replace `toolbox/tools-page-accordions.js`.
- This PR does not modify `toolbox/index.html`.

## Current Rendering State
- `toolbox/index.html` remains transitional.
- `toolbox/tools-page-accordions.js` still owns current Toolbox rendering for Order, Group, Progress, and Build Path.
- `toolbox/tools-page-accordions.js` should be removed only after a registry-driven Toolbox runtime replaces the current rendering path.

## Next Implementation Step
The next implementation PR starts Project Workspace tooling by creating a registry-driven Toolbox runtime for:
- Order
- Group
- Progress
- Build Path

That implementation must consume a declared registry/data source before any runtime database behavior is introduced.

## Validation
- PASS: `git diff --check`.
- SKIPPED: Playwright, because this PR is docs/contract only and Playwright impacted is No.
