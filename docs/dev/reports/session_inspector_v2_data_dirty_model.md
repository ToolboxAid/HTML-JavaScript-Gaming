# Session Inspector V2 Data Dirty Model

## Scope
- Replaced the normalized tool object model with:
  - `schema`
  - `workspace`
  - `data`
  - `dirty`
- Moved repeated workspace/repo/game context into `workspace`.
- Moved actual tool payload data into `data`.
- Added clean dirty tracking defaults:
  - `isDirty: false`
  - `reason: null`
  - `changedAt: null`
  - `changedKeys: []`
- Removed Session Inspector V2 State UI.
- Kept Schema out of the Session Inspector V2 UI.
- Added Session Inspector V2 views:
  - JSON: full stored object
  - Data: selected item `data`
  - Dirty: selected item `dirty`
- Renamed the JSON header Copy button to Copy All.
- Copy All now copies one labeled validation payload containing JSON, Data, and Dirty sections.
- Removed the Workspace Manager V2 Session Inspector tile subtitle `Session storage inspector`.

## Implementation Notes
- Workspace Manager V2 still writes one session key per tool: `workspace.tools.<tool-id>`.
- Workspace Manager V2 still preserves `workspace.repo.reference`.
- Preview Generator V2 reads workspace session context from `workspace.tools.preview-generator-v2.workspace`.
- Preview Generator V2 image generation behavior was not changed.
- Data and Dirty views show actionable empty states when the selected storage item has no matching section.
- Copy All includes Data/Dirty empty-state text in the copied payload when those sections are missing.
- Copy All logs:
  - OK when all three sections copy for a selected normalized tool entry.
  - WARN when the copied payload includes missing Data/Dirty empty states.
  - FAIL when no storage entry is selected or the clipboard API fails.
- Per-tile Delete and Delete All behavior were preserved.

## Guardrails
- No cross-tool communication was added.
- No `.schema` or `.state` split keys were recreated.
- No sample JSON was modified.
- No roadmap content was modified.

## Validation
- Passed `npm run test:workspace-v2` with 15/15 tests.
- Verified normalized tool objects use `schema`, `workspace`, `data`, and `dirty`.
- Verified repeated workspace context is not stored under `state`.
- Verified actual tool payload is stored under `data`.
- Verified dirty defaults to clean.
- Verified Session Inspector V2 has JSON, Data, and Dirty views.
- Verified State and Schema controls are absent from Session Inspector V2 UI.
- Verified Copy is renamed to Copy All.
- Verified Copy All copies one payload with clearly labeled JSON, Data, and Dirty sections.
- Verified Copy All includes empty-state text for missing Data/Dirty sections.
- Verified Copy All logs OK/WARN/FAIL outcomes, including an actionable no-selection error.
- Verified JSON/Data/Dirty accordion behavior does not conflict with other accordions.

## Skipped
- Full samples smoke test was skipped because this PR is scoped to Workspace Manager V2 session hydration and Session Inspector V2 display of normalized browser storage. The requested Workspace V2 Playwright suite covers the changed behavior.
