# BUILD_PR_LEVEL_08_04_PACMAN_BOUNDARY_NORMALIZATION

## Purpose
Normalize **Pacman** to the Phase 08 games-layer boundary model only.

This PR is intentionally narrow:
- no engine edits
- no repo-wide restructuring
- no Space Invaders edits
- no unrelated sample cleanup
- no gameplay feature expansion

## Why this is next
`PR_08_03_GAMES_MIGRATION` added placeholder `rules` folders across many games, but it did **not** complete Phase 08.

What is now true:
- broad folder coverage improved
- placeholder boundaries exist for many games

What is still not true:
- repo-wide flow standardization is not earned
- shared-vs-game utility enforcement is not earned
- Pacman normalization is still not earned
- full current-games migration is still not earned

The smallest valid next move is:
1. normalize **Pacman** to the same game-local boundary model used for focused game migrations,
2. keep the PR game-local and surgical,
3. update Phase 08 status only where actually earned.

## Required boundary target
Pacman should follow this ownership model:

- `games/Pacman/flow/*`
  - attract / intro / highscore flow modules when those states exist
  - no duplicated rule constants
- `games/Pacman/game/*`
  - runtime orchestration and scene wiring only
- `games/Pacman/entities/*`
  - player, ghost, pellet, fruit, tunnel, collision-domain entities
- `games/Pacman/levels/*`
  - maze/layout/start-state progression definitions
- `games/Pacman/rules/*`
  - authoritative game-local constants and flow/rules contracts
- `games/Pacman/assets/*` and platform-local assets
  - only Pacman-owned media/content
- `games/Pacman/systems/*` and `games/Pacman/utils/*`
  - game-specific helpers only

## Implementation goals
Codex should make only the smallest changes needed to achieve the following:

1. Create or normalize a Pacman rules surface
   - add a game-local rules module if missing
   - move duplicated flow/gameplay constants there
   - make flow + gameplay import from one source of truth

2. Normalize flow contract files
   - ensure `flow/attract.js`, `flow/intro.js`, and `flow/highscore.js` exist if the game supports those states
   - keep exports stable unless a correction is required
   - do not change player-facing behavior unless needed to preserve current behavior

3. Normalize gameplay ownership
   - move game-flow constants out of gameplay scene/runtime files into rules
   - keep scene/runtime files focused on orchestration

4. Preserve game-local ownership
   - do not move Pacman assets/utilities into shared unless they are already clearly cross-game
   - do not pull engine utilities into the game folder

5. Update status truthfully
   - only mark roadmap items complete when the repo actually satisfies them after this PR
   - preserve full roadmap line text when editing status markers
   - do not downgrade any item that is already truly complete

## Non-goals
- no engine API redesign
- no start_of_day edits
- no network work
- no sample index work
- no broad tools cleanup
- no Phase 09+ work

## Expected touched areas
- `games/Pacman/flow/*`
- `games/Pacman/game/*`
- `games/Pacman/rules/*`
- optional: `games/Pacman/entities/*`, `levels/*`, `systems/*`, `utils/*`
- roadmap/status docs only if already part of the repo’s active tracking files

## Acceptance criteria
- Pacman has a clear local boundary split for flow/game/rules
- no duplicated flow-rule constants across flow and gameplay
- gameplay scene/runtime files consume rules constants instead of defining them
- no engine files changed
- targeted validation passes
- roadmap status updated only to reflect actual repo truth

## Corrected Phase 08 status after reviewing `PR_08_03_GAMES_MIGRATION`

Earned now:
- [x] `games/_template/` created
- [.] per-game structure normalized
- [.] current games migrated to target structure

Still not earned from the uploaded PRs:
- [ ] game flow pattern standardized (`flow/attract.js`, `flow/intro.js`, `flow/highscore.js`)
- [ ] gameplay/entities/levels/rules/assets boundaries normalized
- [ ] shared-vs-game utility boundaries enforced
- [ ] space_invaders normalized
- [ ] pacman normalized
- [ ] future games follow template-first path

## Suggested commit title
`build(games): normalize pacman boundaries for phase 08`

## After this PR
Phase 08 should be reassessed strictly from repo truth. Likely remaining work after Pacman will be:
- Space Invaders normalization, if not already fully implemented in repo
- shared-vs-game utility boundary enforcement
- final truthful status alignment
