# BUILD PR — Games Template Contract Enforcement

## Purpose
Codify and enforce the required structure and behavior for all games using the validated template system.

## Scope (STRICT)
- Define required folder structure
- Define required index.html behavior
- Enforce canvas-first rendering
- Prevent cross-game imports
- No gameplay changes

## Required Structure
games/<GameName>/
- index.html
- game/
- entities/
- systems/
- ui/
- assets/

## Required Behavior
- must render via canvas
- must use shared engine/theme shell
- must support debug integration

## Prohibited
- DOM gameplay rendering
- cross-game imports
- hardcoded paths to other games

## Allowed Changes
- add validation rules
- add lightweight enforcement checks
- update template if needed

## Non-Goals
- no refactor of existing games
- no gameplay changes

## Acceptance Criteria
- structure rules defined
- behavior rules defined
- no runtime impact
- no existing games broken

## Output
<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_CONTRACT_ENFORCEMENT_delta.zip
