# Architecture Review v1

## games findings

### Findings
1. `games/` is not a single architecture pattern. It contains multiple full game implementations that span at least two major styles:
   - newer engine-shell games centered on `GameBase` plus per-game runtime/state/ui folders
   - older direct game classes that still import many engine internals directly from `engine/core`, `engine/game`, and `engine/renderers`

   This mirrors the earlier `samples/` finding that the repo currently teaches two major consumer patterns.

2. The strongest architecture in `games/` is the newer **runtime/state/ui/world split** seen most clearly in `games/Asteroids/`:
   - `runtime/`
   - `state/`
   - `systems/`
   - `ui/`
   - focused top-level entry (`game.js`)
   - explicit app/session context

   This is the clearest “modern game architecture” in the repo and looks like the intended direction.

3. `games/Asteroids/game.js` uses the engine shell cleanly:
   - subclasses `GameBase`
   - creates `KeyboardInput` in `onInitialize()`
   - builds a game-specific app context
   - delegates runtime/state work to focused modules

   This is currently the best proof that the engine can support a stronger application architecture.

4. Older games such as `Space Invaders`, `Pong Game`, and several others are much flatter. Their `game.js` files often import many engine internals directly, including:
   - `CanvasUtils`
   - `CanvasSprite`
   - `CanvasText`
   - `Sprite`
   - `GamePlayerSelectUi`
   - `GameUtils`
   - `PrimitiveRenderer`
   - various math/misc helpers

   These games still work, but architecturally they are closer to “engine-powered apps with direct internal access” than to consumers of a narrow public engine API.

5. The `games/` folder therefore confirms the repo currently supports **two major game patterns**:
   - **modern shell pattern**: `GameBase` + local runtime/state/ui/system folders
   - **legacy direct-integration pattern**: `GameBase` or manual game loop + many direct engine module imports

   This is the most important consumer-level finding.

6. Several games depend on helpers previously flagged as misplaced in engine boundaries:
   - `engine/game/gameUtils.js`
   - `engine/game/gamePlayerSelectUi.js`
   This confirms those files behave more like shared gameplay/game-shell helpers than pure engine infrastructure.

7. Boundary discipline is weak at the game-consumer level. Games often import engine modules that appear internal or subsystem-specific rather than importing from a clearly defined public surface.

8. `games/` is still valuable architecturally because it functions as a reality check:
   - what games actually need
   - what abstractions are missing
   - which engine boundaries are too porous

   In practice, `games/` is revealing the gap between the engine’s intended architecture and its real consumption patterns.

9. The folder-level organization by game title is fine, but architectural maturity is uneven across games:
   - some games have runtime/state/system layering
   - others are mostly flat files
   - some have clearer config/runtime separation than others

10. Best current classification at the game-consumer level:

   **canonical / target pattern**
   - `games/Asteroids/`

   **legacy / transitional consumers**
   - `games/Space Invaders/`
   - `games/Pong Game/`
   - and several other flatter game folders

   This is not a quality judgment about the games themselves; it is an architecture maturity judgment about how they consume the engine.

### Risks
#### High
1. **Two major consumer patterns in active use**
   The repo currently validates both a modern shell architecture and a legacy direct-integration architecture. That makes it harder to define the official engine usage model.

2. **Games depend on engine internals freely**
   Many games import deep engine modules directly, which weakens the public/internal boundary story and makes refactors riskier.

3. **Shared gameplay helpers live inside engine folders**
   Helpers like `gameUtils.js` and `gamePlayerSelectUi.js` are being used by games as if they are part of the engine contract, even though they were previously identified as misplaced.

#### Medium
4. **Architectural maturity is uneven across games**
   Some games model runtime/state/system boundaries; others remain flat and tightly coupled.

5. **Modern pattern is not formally promoted**
   `Asteroids` looks like the strongest architecture example, but there is no explicit repo-level designation that it is the preferred game structure.

6. **Refactor pressure is asymmetric**
   Future engine cleanup may be blocked by older games that consume internal modules directly.

#### Lower
7. **Folder-by-title organization hides architecture status**
   It is easy to treat all games as equivalent examples even though some are reference-quality patterns and others are legacy integrations.

### PR Candidates
#### PR-046 — Classify games by architecture maturity
- Type: architecture/docs
- Risk: low
- Goal: label each game as:
  - canonical modern architecture
  - maintained legacy integration
  - experimental/prototype
- Make it clear which game structure new work should follow

#### PR-047 — Promote `games/Asteroids` as the canonical game architecture reference
- Type: docs/architecture
- Risk: low
- Goal: formally designate Asteroids as the best current example of:
  - runtime split
  - state ownership
  - UI separation
  - system layering

#### PR-048 — Define allowed engine imports for games
- Type: architecture/docs
- Risk: low
- Goal: document which engine modules games should treat as stable/public versus internal/transitional

#### PR-049 — Extract shared gameplay helpers out of engine folders
- Type: architecture/refactor
- Risk: medium
- Goal: move:
  - `engine/game/gameUtils.js`
  - `engine/game/gamePlayerSelectUi.js`
  into a shared gameplay or shell layer used by games and samples

#### PR-050 — Create a migration plan from legacy direct-integration games to the modern shell pattern
- Type: architecture/roadmap
- Risk: medium
- Goal: identify which older games should be:
  - left as legacy references
  - partially modernized
  - fully migrated later

## PR Roadmap Additions

### PR-046
Title: Classify games by architecture maturity
Scope: games, docs
Risk: Low
Status: pending

### PR-047
Title: Promote Asteroids as canonical game architecture reference
Scope: games/Asteroids, docs
Risk: Low
Status: pending

### PR-048
Title: Define allowed engine imports for games
Scope: games, docs
Risk: Low
Status: pending

### PR-049
Title: Extract shared gameplay helpers out of engine folders
Scope: engine/game, games/shared, samples
Risk: Medium
Status: pending

### PR-050
Title: Create migration plan for legacy games
Scope: games, docs/reviews
Risk: Medium
Status: pending
