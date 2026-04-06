Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_SHOWCASE_GAME_CARD_SAFE_FINISH.md

# PLAN_PR_SHOWCASE_GAME_CARD_SAFE_FINISH

## Goal
Finish Debug Showcase presentation in `games/index.html` safely by placing showcase guidance on existing cards and a shared intro block while preserving card structure and order.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Preserve current game order exactly.
- Preserve current anchor-card structure exactly.
- Keep Debug Showcase badge in header.
- Keep Debug Showcase badges on Asteroids and Breakout cards.
- Add safe non-interactive showcase copy to Asteroids and Breakout cards.
- Add shared showcase intro/help block above relevant game grid.
- Place `Debug Tour` and `Getting Started` links in shared showcase intro block (not inside cards).
- Add onboarding helper text in shared showcase block.

## Out of Scope
- Nested links inside cards.
- Buttons inside cards.
- Engine/runtime changes.
- Unrelated card edits.

## Acceptance Criteria
- Card order is unchanged.
- Card anchor structure remains unchanged.
- Only Asteroids/Breakout card text changes.
- Shared intro block contains Play/Debug paths, docs links, and onboarding text.
- No interactive controls are embedded inside cards.