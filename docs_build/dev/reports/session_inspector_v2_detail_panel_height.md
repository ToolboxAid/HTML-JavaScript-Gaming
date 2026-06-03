# Session Inspector V2 Detail Panel Height

## Scope
- Constrained Session Inspector V2 JSON and Data detail bodies so long content scrolls inside those panels.
- Kept lower Dirty and Status headers visible/reachable when JSON/Data contain large payloads.
- Preserved the fresh JSON/Data/Dirty/Status V2 accordion behavior.
- Added live dirty state text to the Dirty header:
  - `Dirty: false`
  - `Dirty: true`
  - `Dirty: unknown`

## Implementation Notes
- JSON and Data sections now use bounded detail-scroll content bodies.
- JSON/Data output content no longer drives uncontrolled right-panel growth.
- Dirty header value is updated by `DirtyControl` from the selected item’s `dirty.isDirty` boolean.
- Missing or non-boolean dirty state displays `Dirty: unknown`.

## Preserved Behavior
- Copy All still copies the labeled JSON/Data/Dirty payload.
- Clear Status still clears the status log.
- JSON, Data, Dirty, and Status accordions still open and close independently.
- Storage tile layout, per-tile Delete, and Delete All behavior were preserved.
- Normalized session object shape was not changed.

## Guardrails
- No cross-tool communication was added.
- No sample JSON was modified.
- No roadmap content was modified.

## Validation
- Passed `npm run test:workspace-v2` with 15/15 tests.
- Verified long JSON content scrolls inside the JSON body.
- Verified long Data content scrolls inside the Data body.
- Verified Dirty and Status headers remain visible/reachable.
- Verified Dirty header values for clean, dirty, and missing dirty data.
- Verified Copy All and Clear Status still work.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is Session Inspector V2 panel layout and header state, covered by `npm run test:workspace-v2`.
