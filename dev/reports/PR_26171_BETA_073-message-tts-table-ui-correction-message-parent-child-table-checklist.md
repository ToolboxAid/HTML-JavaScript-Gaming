# PR_26171_BETA_073-message-tts-table-ui-correction Message Parent-Child Table Checklist

Generated: 2026-06-20T23:06:25.711Z
Team ownership: Bravo

- PASS: Parent table remains `Messages`.
- PASS: Message name cell owns expand/collapse and exposes `aria-expanded`.
- PASS: Keyboard Enter/Space on the message name cell toggles the child table.
- PASS: Clicking the Parts count cell does not expand the child table.
- PASS: Child table remains `Message Parts` with ordered parts.
- PASS: Child table includes Order, Text, Emotion, TTS Profile, Status, and Actions columns.
- PASS: Add Message is an inline table action row and opens an inline add row.
- PASS: Edit Message opens an inline edit row.
- PASS: Add Part is an inline child-table action row and opens an inline add row.
- PASS: Edit Part opens an inline edit row.
- PASS: Play Message, Play Part, and Stop remain visible and validated.
- PASS: No separate Emotion Studio was introduced.
