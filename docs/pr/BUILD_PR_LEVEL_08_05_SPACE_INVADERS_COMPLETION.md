# BUILD_PR — LEVEL 08.05 SPACE INVADERS COMPLETION

## Purpose
Complete Space Invaders boundary normalization to match Asteroids and Puckman.

## Scope
- Only Space Invaders game folder
- No engine changes
- No flow standardization enforcement
- No cross-game refactor

## Required Structure
games/SpaceInvaders/
  flow/
  game/
  rules/
  entities/
  levels/
  assets/
  systems/
  ui/
  utils/

## Acceptance Criteria
- flow files exist (attract, intro, highscore)
- rules centralized in rules/
- game runtime consumes rules
- no duplicate constants across flow/game

## Out of Scope
- index.html
- launcher/bootstrap
- engine wiring
