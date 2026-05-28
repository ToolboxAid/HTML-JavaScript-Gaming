# PR_26146_068 MIDI Studio V2 Accordion Audit

## Scope

Audited MIDI Studio V2 `.accordion-v2[data-midi-studio-tab-panel]` sections across the existing tabs:

- Song Setup
- Octave Timeline
- Instruments
- Auto-Create Parts
- MIDI Import
- Diagnostics
- Export

## Findings

- PASS - Shared accordion headers now use `X` for open and `+` for collapsed state.
- PASS - Header icon state is synchronized through `data-accordion-v2-icon-state`.
- PASS - Hidden-tab accordions are tested only when their owning tab is active, avoiding false hidden-panel clicks.
- PASS - Octave Timeline Instruments header controls remain in the established Duplicate, Move Up, Move Down, Add, toggle order.
- PASS - Instruments tab header now has a standard accordion state icon.
- PASS - Instruments and Octave Timeline custom header X controls now toggle open/closed and update label/title from Collapse to Expand when collapsed.
- PASS - Header controls inside accordion headers do not double-toggle through parent header clicks.

## Repairs

- `AccordionSection` now updates standard `.accordion-v2__icon` text to `X`/`+`.
- `AccordionSection` now also updates custom `[data-accordion-v2-toggle-button]` controls.
- `InstrumentGridControl` programmatic accordion toggles now update class, `aria-expanded`, hidden state, icon state, and custom toggle label/title.
- The previous custom X-only close buttons are no longer dead when the accordion is collapsed.

## Validation Notes

The Playwright accordion audit switches through tabs, scopes headers by `data-midi-studio-tab-panel`, closes each visible accordion, verifies content is hidden and state icon is `+`, then reopens and verifies content is visible and state icon is `X`.
