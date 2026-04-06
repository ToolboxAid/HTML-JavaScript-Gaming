MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Create PR_SHOWCASE_GAME_CARD_SAFE_FINISH_FULL

PURPOSE:
Finish the Debug Showcase presentation in games/index.html without breaking the existing card structure and order. Place showcase data on existing cards.

IN SCOPE:
- preserve current game order exactly
- preserve current anchor-card structure exactly
- keep Debug Showcase badge in header
- keep Debug Showcase badges on Asteroids and Breakout cards
- add safe non-interactive showcase copy to Asteroids and Breakout cards
- add a shared showcase intro/help block above the relevant game grid
- place Debug Tour and Getting Started links in the shared showcase intro block, not inside cards
- add onboarding helper text in the shared showcase block

OUT OF SCOPE:
- no nested links inside cards
- no buttons inside cards
- no engine changes
- no unrelated card edits

RULES:
- surgical change only
- preserve existing layout patterns
- do not reorder games
- do not convert card anchors into multi-action containers unless explicitly required later

OUTPUT:
<project folder>/tmp/PR_SHOWCASE_GAME_CARD_SAFE_FINISH_FULL_bundle.zip