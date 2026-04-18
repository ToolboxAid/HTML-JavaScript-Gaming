# Games Template Contract

## Purpose
Define enforceable structure and shell behavior for games that opt into the validated template migration system.

## Applicability
This contract applies to:
- `games/_template/`
- any `games/*_next/` migration lane
- canonical games currently migrated through the validated pipeline:
  - `games/PacmanLite/`
  - `games/SpaceInvaders/`

Games outside this scope are not blocked by this contract until they are migrated through the same validated pipeline.

## Required Structure
Each contract-managed game directory must include:
- `index.html`
- `assets/`
- `game/`
- `entities/`
- `systems/`
- `ui/`
- `debug/`

## Required Shell Behavior
`index.html` must:
- include a visible `<canvas` element
- include shared shell/theme baseline stylesheet usage via `/src/engine/ui/baseLayout.css`

## Prohibited
- DOM-first gameplay rendering as the primary runtime surface
- imports or executable references to other games under `/games/<OtherGame>/`
- hardcoded executable paths into other game directories

## Enforcement
Use:
- `node scripts/validate-games-template-contract.mjs`

The validator writes:
- `docs/reports/games_template_contract_validation.txt`

and exits non-zero on contract violations.
