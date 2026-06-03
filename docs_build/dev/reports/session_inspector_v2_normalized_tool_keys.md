# Session Inspector V2 Normalized Tool Keys

## Scope
- Normalized Workspace Manager V2 tool hydration from split `workspace.tools.<tool-id>.schema` and `workspace.tools.<tool-id>.state` keys into one `workspace.tools.<tool-id>` key per tool.
- Preserved `workspace.repo.reference`.
- Updated Preview Generator V2 to read its nested `state` from `workspace.tools.preview-generator-v2` so workspace launch repo/game context still resolves through session storage.
- Renamed the Session Inspector V2 Details section/control to JSON.
- Added a Schema section/control that renders only the selected entry's top-level `schema` data.

## Implementation Notes
- Each Workspace Manager V2 tool session value is now a combined object with:
  - `schema`
  - `state`
- Session Inspector V2 now renders normalized tool hydration as one tile per tool because the writer no longer creates split schema/state keys.
- JSON renders the full stored value for the selected tile.
- Schema renders only `value.schema` when present.
- Schema shows an actionable empty state when the selected value has no top-level `schema` section.
- Per-tile Delete still removes the selected storage key. For normalized tool tiles, that removes the single `workspace.tools.<tool-id>` key.
- Delete All still clears all currently displayed storage entries.

## Guardrails
- No cross-tool direct communication was added.
- No sample JSON was modified.
- No roadmap content was modified.
- Game manifest SSoT semantics were not changed.

## Validation
- Passed `npm run test:workspace-v2` with 15/15 tests.
- Verified Workspace Manager V2 creates normalized per-tool keys only.
- Verified old `.schema` and `.state` per-tool keys are not created by Workspace Manager V2 hydration.
- Verified Session Inspector V2 JSON and Schema sections.
- Verified Schema empty state for a selected entry without `schema`.
- Verified per-tile Delete and Delete All behavior.
- Verified Preview Generator V2 still resolves repo/game context and can generate a preview from workspace launch.

## Skipped
- Full samples smoke test was skipped because this PR is limited to Workspace Manager V2 session hydration, Session Inspector V2 storage display, and the Preview Generator V2 workspace session read path. The requested targeted Workspace V2 Playwright validation covers the changed behavior.
