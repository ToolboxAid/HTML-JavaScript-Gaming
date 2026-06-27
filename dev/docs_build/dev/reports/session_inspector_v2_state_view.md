# Session Inspector V2 State View

## Scope
- Removed the Session Inspector V2 Schema section/control.
- Removed Session Inspector V2 user-facing Schema labels.
- Added a State section/control.
- Preserved the JSON section as the full selected storage object view.
- Preserved normalized Workspace Manager V2 tool hydration keys:
  - `workspace.tools.<tool-id>`
- Did not recreate split `.schema` or `.state` per-tool session keys.

## Implementation Notes
- `StateControl` renders only the selected normalized tool object's top-level `state` section.
- When a selected entry has no top-level `state`, State shows an actionable empty state naming the selected storage entry.
- JSON still renders the full stored value for the selected tile.
- JSON and State accordions use the existing Session Inspector V2 accordion pattern and were validated alongside Controls, Filters, Entries, and Status.
- Per-tile Delete and Delete All behavior were preserved.

## Guardrails
- No cross-tool communication was added.
- Preview Generator V2 image generation behavior was not modified.
- Sample JSON was not modified.
- Roadmap content was not modified.

## Validation
- Passed `npm run test:workspace-v2` with 15/15 tests.
- Verified no Session Inspector V2 Schema control/label remains.
- Verified State control appears.
- Verified State shows only selected item `state`.
- Verified JSON shows the full selected item object.
- Verified JSON and State accordions open and close predictably.
- Verified Controls, Filters, Entries, and Status accordions still work.
- Verified normalized `workspace.tools.<tool-id>` keys remain.
- Verified old split `.schema` and `.state` tool keys are not recreated.

## Skipped
- Full samples smoke test was skipped because this PR is limited to the Session Inspector V2 JSON/State view and normalized Workspace V2 session-key validation. The requested targeted Workspace V2 Playwright suite covers the affected behavior.
