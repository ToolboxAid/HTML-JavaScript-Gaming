MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Execute PLAN + BUILD + APPLY for BREAKOUT_DEBUG_SHOWCASE_POLISH.

IN SCOPE:
- add `Debug Showcase` to the Breakout header in `games/index.html`
- apply a unique color for the showcase label
- add `Debug: ON/OFF` badge
- add default preset auto-load behavior
- add `Open Debug Panel` button
- add 1-2 lines of inline mini help

RULES:
- Breakout only
- preserve existing formatting patterns
- no unrelated runtime refactors
- no unrelated game entry edits

OUTPUT:
Create:
<project folder>/tmp/PR_BREAKOUT_DEBUG_SHOWCASE_POLISH_FULL_bundle.zip