MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.33.

PR 11.32 had no effect. The uploaded platformShell.css already shows responsive grid rules exist for:
- .tools-platform-frame__nav
- .tools-platform-frame__nav-grid

Therefore do not just repeat the same grid rule.

Find and fix the actual overflow source.

Inspect rendered DOM/classes and CSS around Workspace Manager tiles. Check:
1. Is the tile wrapper actually `.tools-platform-frame__nav-grid`?
2. Are tile cards/grid items forcing min-content width?
3. Are badges/links using `white-space: nowrap` and forcing card width?
4. Are parent containers using fixed/calc widths that exceed viewport?
5. Is the visible purple panel inside a wider `.tools-platform-frame`, `.wrap`, `.app`, or header constraint?
6. Are sections/cards missing `min-width: 0` or `max-width: 100%`?
7. Is horizontal overflow hidden on the wrong element only, leaving visual runoff?

Required CSS behavior:
- all Workspace Manager tile grid parents and children must have `min-width: 0`
- tile cards must have `max-width: 100%` and `box-sizing: border-box`
- long labels/status badges may wrap or ellipsize without increasing card width
- grid must use a true responsive definition such as:
  `grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));`
  or equivalent
- add a narrow-screen media rule if needed:
  `grid-template-columns: 1fr;`
- do not rely only on `overflow-x: hidden` as the fix; prevent the overflow source.

Likely file:
- tools/shared/platformShell.css

Only touch platformShell.js if the generated markup is using the wrong class/wrapper.

Validation:
node --check tools/shared/platformShell.js
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

Manual validation:
Open sample 1902 -> Workspace Manager.
Shrink browser width to match the screenshot.
Confirm:
- no tile runoff beyond the right edge
- cards wrap to fewer columns
- cards can collapse to one column
- labels/badges do not force overflow

REPORT:
Write docs/dev/reports/PR_11_33_validation.txt with:
- changed files
- actual overflow source found
- why PR 11.32 had no effect
- before/after manual validation
- validation command results
