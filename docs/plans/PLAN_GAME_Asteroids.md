Toolbox Aid
David Quesenberry
03/22/2026
PLAN_GAME_Asteroids.md

# PLAN_GAME — Asteroids

## Section
Games

## Game Folder Target
/games/Asteroids/
/games/index.html

## Goal
Build a first real game under /games/ that stays as close to the original Asteroids feel and structure as practical while still using the engine public contracts, while also supporting high score and selectable 1-player or 2-player play.

## Game Identity
Asteroids should preserve the classic arcade feel:
- vector-style presentation
- ship rotation, thrust, inertia, and drift
- asteroid breakup into smaller pieces
- wraparound playfield
- simple score, lives, wave, and game-over flow
- high score support
- 1-player / 2-player select
- player 1 and player 2 scores
- player lives shown as ships under the score
- minimal UI and clean classic presentation

## Locked Game Rules
- Games live in /games/
- Games use names, not sample numbers
- Game pages use the canvas theme for page theme only
- Each game must include a Header
- Each game page must include a Classes Used section
- Create /games/index.html similar to /samples/index.html
- Game code must consume engine public contracts and must not bypass engine rules

## Proposed Structure
/games/
  index.html
  /Asteroids/
    index.html
    README.md
    main.js
    scenes/
    data/
    assets/      (only if needed)
    ui/          (only if needed)

Exact filenames may be adjusted in build to fit the repo, but the target folder is locked as /games/Asteroids/.

## Original-Faithful Gameplay Scope
- Single cabinet-style local play
- Start screen with 1-player / 2-player select
- Ship starts centered for active player
- Rotate left/right
- Thrust forward
- Fire projectiles
- Momentum/inertia retained
- Screen wrapping for ship, bullets, and asteroids
- Large asteroids split into smaller asteroids
- Collision between bullets and asteroids
- Collision between ship and asteroids
- Score system
- High score system
- Lives system
- Wave progression
- Game over and restart flow

## Player / Score Scope
- Support Player 1 and Player 2 score tracking
- Show score labels for P1 and P2
- Show remaining lives visually as ship icons under each player's score
- Support 1-player mode and 2-player mode selection from the start flow
- Use a classic-style alternating or shared cabinet-friendly flow as chosen in build, but remain original-faithful in spirit
- Keep score/life presentation minimal and readable

## High Score Direction
- Include high score display on the game screen and/or title/start screen
- Use engine-owned persistence paths only if persistence is included
- No ad hoc browser storage logic in game scene code
- Keep the implementation restrained and classic-friendly

## Original-Faithful Presentation Scope
- Vector-like rendering style preferred
- Black background
- Simple white line or classic vector-feel objects
- Minimal HUD
- Player scores visible
- Lives represented as ships under the score
- No modern clutter by default
- Canvas theme used for page theme only around the game page

## Engine Systems Expected To Be Used
- Engine lifecycle
- Canvas renderer
- Input services / action input
- Scene system
- Collision system
- Vector rendering support if available
- Precision collision path where justified
- Audio only if it can remain restrained and faithful
- Persistence only for high score if included

## Collision Direction
Asteroids should favor the engine collision stack in a classic-friendly way:
- broad phase
- polygon/shape collision
- only use finer mask/pixel checks if truly needed

The game should validate accurate collision without turning game files into collision-system owners.

## Audio Direction
Keep audio restrained and classic-friendly:
- fire
- thrust
- explosion
- optional simple background silence by default

No direct audio API usage should live in game scene code.

## Build Scope
- Create /games/Asteroids/
- Create /games/index.html
- Use canvas theme on the game page
- Include Header in all newly created files
- Include Classes Used section on the game page
- Keep reusable logic in engine
- Keep game-specific orchestration in /games/Asteroids/
- Preserve a close-to-original Asteroids feel instead of over-modernizing
- Add high score support
- Add start flow for 1-player / 2-player select
- Add Player 1 and Player 2 score display
- Add ship-icon life display under score

## Acceptance Targets
- Game runs from /games/Asteroids/
- /games/index.html links to Asteroids
- Game page uses canvas theme
- Game page includes Header and Classes Used section
- Ship movement, shooting, wraparound, and asteroid breakup work
- Score, lives, wave, and game-over loop are clear
- High score is clearly shown
- Start flow supports 1-player and 2-player selection
- Player 1 and Player 2 score areas are clear
- Lives are displayed as ships under the score
- Presentation stays close to original Asteroids
- Game uses engine public contracts without bypassing engine ownership rules
- Repo structure remains clean and consistent

## Explicit Non-Goals For This First Build
- No online multiplayer
- No co-op networking
- No large UI framework dependence beyond what is necessary
- No overdesigned menus
- No RPG-style upgrades or power systems
- No game-specific logic promoted into engine unless truly reusable

## Recommended Build Order
1. Create /games/index.html
2. Create /games/Asteroids/
3. Implement playable ship + asteroid core loop
4. Add score, lives, waves, and game-over flow
5. Add 1-player / 2-player selection and player score/life HUD
6. Add high score persistence only if the core is stable

## Commit Scope
Single purpose:
Build the first named game under /games/ and validate the engine with an original-faithful Asteroids implementation including high score and 1-player / 2-player support.
