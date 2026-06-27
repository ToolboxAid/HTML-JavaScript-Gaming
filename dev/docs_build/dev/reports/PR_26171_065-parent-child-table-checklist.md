# PR_26171_065 Parent Child Table Checklist

## Parent Messages Table

- PASS: Table label is Messages.
- PASS: Header includes Message Name.
- PASS: Header includes Type.
- PASS: Header includes Status.
- PASS: Header includes Parts.
- PASS: Header includes Default TTS Profile.
- PASS: Header includes Actions.
- PASS: Add Message creates an inline add row.
- PASS: Edit Message creates an inline edit row.
- PASS: Play Message button exists.
- PASS: Play Message queues active child parts by order.

## Child Message Parts Table

- PASS: Child table opens under the selected parent message.
- PASS: Child table label is Message Parts.
- PASS: Header includes Order.
- PASS: Header includes Text.
- PASS: Header includes Emotion.
- PASS: Header includes TTS Profile.
- PASS: Header includes Status.
- PASS: Header includes Actions.
- PASS: Add Part creates an inline add row.
- PASS: Edit Part creates an inline edit row.
- PASS: Play Part button exists.

## Ownership Boundaries

- PASS: Message Studio owns text and message part ordering.
- PASS: TTS Profile authoring is left to future TTS Studio work.
- PASS: Audio playback is delegated to the audio engine.
- PASS: Local API remains the source for message and part records.
- PASS: No browser storage or page-local product-data source of truth was added.

## UI Constraints

- PASS: Theme V2 only.
- PASS: External JavaScript only.
- PASS: No inline styles.
- PASS: No style blocks.
- PASS: No inline event handlers.
- PASS: No page-local CSS.
- PASS: No tool-local CSS.
