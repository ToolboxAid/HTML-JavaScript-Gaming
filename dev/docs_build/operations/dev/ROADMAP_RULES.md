# ROADMAP RULES

## Status authority
Roadmap status must be evidence-backed and scoped.

## Required distinction
A line may be marked complete for:
- a named game
- a defined subset (for example, core games)
- the full repo

These scopes must not be collapsed into one another.

## Placeholder rule
`.gitkeep` folders and placeholder-only directories do not count as completion.

## Repo-wide completion rule
Repo-wide boundary completion requires all in-scope game folders to pass the active contract.
If a contract is intended only for target/core games, the roadmap must say so explicitly.

## Games-layer scope rule
Section 8 lines must explicitly state scope:
- core/target-game completion
- or repo-wide adoption
Do not mark repo-wide lines complete from core-game evidence alone.

## Validation rule
Validation reports may provide facts and recommendations.
Roadmap status changes require an explicit docs update aligned to the real scope.

## Boundary scan interpretation rule
Boundary scan facts must be recorded line-by-line:
- games with no violations may support game-specific `[x]` lines
- remaining violations in other game folders keep repo-wide lines below `[x]`
