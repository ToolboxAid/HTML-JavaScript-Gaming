# Session Inspector V2 Output Scrollbars

## Scope
- Moved Session Inspector V2 detail scrolling onto the output `<pre>` elements.
- Ensured these outputs own their vertical and horizontal scroll behavior:
  - `#sessionInspectorV2JsonOutput`
  - `#sessionInspectorV2DataOutput`
  - `#sessionInspectorV2DirtyOutput`
- Kept JSON/Data/Dirty accordion containers bounded so long content does not hide lower headers.

## Implementation Notes
- Detail accordion content wrappers now hide overflow instead of owning the primary scrollbars.
- JSON/Data/Dirty output `<pre>` elements use internal scrolling and preserve unwrapped text for horizontal overflow.
- Dirty and Status headers remain visible/reachable with long JSON/Data content.

## Preserved Behavior
- Dirty header values remain:
  - `Dirty: false`
  - `Dirty: true`
  - `Dirty: unknown`
- Copy All still copies the labeled JSON/Data/Dirty payload.
- Clear Status behavior was preserved.
- JSON/Data/Dirty/Status accordion behavior was preserved.
- Normalized session object shape was not changed.

## Guardrails
- No cross-tool communication was added.
- No sample JSON was modified.
- No roadmap content was modified.

## Validation
- Passed `npm run test:workspace-v2` with 15/15 tests.
- Verified JSON scrollbar ownership is inside `#sessionInspectorV2JsonOutput`.
- Verified Data scrollbar ownership is inside `#sessionInspectorV2DataOutput`.
- Verified Dirty scrollbar ownership is inside `#sessionInspectorV2DirtyOutput` when Dirty content overflows.
- Verified accordion containers do not grow uncontrollably.
- Verified Dirty and Status headers remain visible/reachable.
- Verified Copy All still works.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is Session Inspector V2 output scrolling and is covered by `npm run test:workspace-v2`.
