# BUILD_PR — LEVEL 08.07 ROADMAP SCOPE CORRECTION

## Purpose
Correct Section 8 roadmap status so it reflects the actual repo state after boundary validation.

## Why this PR exists
The repo-wide boundary scan shows that only the normalized core games currently satisfy the strict
`flow/game/rules` boundary contract:
- Asteroids
- Pacman
- SpaceInvaders

Many other game folders still contain placeholder-only `rules/` directories and do not contain the
required `flow/{attract.js,intro.js,highscore.js}` files. Therefore, repo-wide enforcement has not
been earned yet.

## Scope
Docs only.
- Update roadmap markers and wording
- Update roadmap rules wording for explicit scope handling
- Preserve completed work for the normalized core games
- Do not modify game code
- Do not force all sample/prototype games into the same contract in this PR

## Required roadmap correction
Section 8 should distinguish between:
1. **Core game normalization completed**
2. **Repo-wide adoption incomplete**
3. **Future template-first rule still pending**

## Recommended status model
- [x] `games/_template/` created
- [x] core target games normalized (`Asteroids`, `Pacman`, `SpaceInvaders`)
- [.] per-game structure normalized
- [.] current games migrated to target structure
- [ ] game flow pattern standardized repo-wide
- [ ] gameplay/entities/levels/rules/assets boundaries normalized repo-wide
- [ ] shared-vs-game utility boundaries enforced repo-wide
- [ ] future games follow template-first path

## Notes
Do not mark repo-wide items complete based only on the three normalized games.
Do not count placeholder folders as completion.
Do not expand this PR into code changes.

## Validation input used
- Latest boundary scan result: no violations for `Asteroids`, `Pacman`, `SpaceInvaders`.
- Boundary violations still present in multiple other `games/*` folders.
