# Session Inspector V2 Reapply Detail Accordions

## Scope
- Replaced the custom `div role="button"` accordion headers for:
  - JSON
  - Data
  - Dirty
  - Status
- Reapplied those four sections with the same working V2 pattern used by the other Session Inspector V2 sections:
  - real `button.accordion-v2__header`
  - `aria-expanded`
  - `aria-controls`
  - shared `AccordionSection` binding
- Kept Copy All and Clear Status as separate header-adjacent action buttons so they do not nest inside accordion buttons.

## Preserved Behavior
- Copy All still copies one payload containing labeled JSON, Data, and Dirty sections.
- JSON still shows the full selected storage object.
- Data still shows only the selected normalized tool `data` section or actionable empty-state text.
- Dirty still shows only the selected normalized tool `dirty` section or actionable empty-state text.
- Status + Clear Status behavior is preserved.
- Storage tiles, per-tile Delete, and Delete All behavior were not changed.
- Normalized session object shape was not changed.

## Validation Notes
- JSON, Data, Dirty, and Status now open and close through fresh V2 accordion buttons.
- Each of the four sections was validated independently:
  - closing JSON does not close Data, Dirty, or Status
  - closing Data does not close JSON, Dirty, or Status
  - closing Dirty does not close JSON, Data, or Status
  - closing Status does not close JSON, Data, or Dirty
- Copy All and Clear Status were validated after the accordion reapply.

## Guardrails
- No cross-tool communication was added.
- No sample JSON was modified.
- No roadmap content was modified.

## Skipped
- Full samples smoke test was skipped by request. The changed surface is Session Inspector V2 UI accordion behavior and is covered by `npm run test:workspace-v2`.
