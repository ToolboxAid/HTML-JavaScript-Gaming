# PR_26126_087 Asset Manager V2 Accordion Behavior Notes

Date: 2026-05-06

## Scope

- Output Summary and Status remain in the right Asset Manager V2 panel.
- Output Summary now has an explicit `asset-manager-v2__accordion--output` layout hook.
- Status keeps its explicit `asset-manager-v2__accordion--status` layout hook.
- The Status header remains a non-nested button pattern: the header is keyboard-focusable with `role="button"`, while the Clear button stays inside the same visual header row.

## Behavior

- Output Summary collapse:
  - toggles `aria-expanded` from `true` to `false`
  - sets `#inspectorContent.hidden`
  - shrinks the Output Summary section to header height
  - releases vertical space in the right panel
- Output Summary expand:
  - restores `#inspectorContent`
  - lets `#inspectorOutput` fill the available content height above Status
- Status collapse:
  - toggles `aria-expanded` from `true` to `false`
  - sets `#statusLogContent.hidden`
  - shrinks the Status section to header height
  - keeps the collapsed Status header at the bottom-right of the right panel
- Status expand:
  - restores the status log content
  - keeps the expanded Status section at the bottom-right

## Layout Notes

- The right panel uses `justify-content: space-between` so Output Summary stays at the top and Status stays at the bottom when either section collapses.
- Expanded Output Summary uses flexible height; expanded Status uses a fixed 260px basis.
- Collapsed right-panel accordions use `flex: 0 0 auto` and hidden content, so they release vertical space.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright asserts Output Summary collapse/expand, Status collapse/expand, hidden content state, section height shrinkage, Output Summary fill behavior, and Status bottom placement.
- A direct browser layout probe during implementation measured Status at 15px from the right-panel bottom after Output Summary collapsed, after Output Summary re-expanded, and after Status collapsed.

