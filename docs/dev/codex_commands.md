MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.32.

Fix the Workspace Manager tool tile grid so tiles do not overflow the container when the browser width shrinks.

Use responsive wrapping:
- allow cards to wrap to fewer columns
- down to one column on narrow widths
- keep cards within container width
- avoid fixed-width layouts that exceed the panel
- use minmax/min-width: 0/box-sizing as needed
- ensure long labels/status text does not force horizontal overflow

Do NOT:
- change tool data or payload logic
- change palette handoff
- change fullscreen behavior
- change navigation behavior
- touch start_of_day folders
- add broad refactors

Likely targets:
- tools/shared/platformShell.js if styles are inline/generated there
- related shared shell CSS/style block if tile grid styles live elsewhere

Validation:
node --check tools/shared/platformShell.js
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

Manual validation:
Open sample 1902 -> Workspace Manager.
Shrink browser width.
Confirm:
- tile cards wrap inside the purple container
- no horizontal runoff
- grid can collapse to one column
