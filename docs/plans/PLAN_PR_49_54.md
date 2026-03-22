Toolbox Aid
David Quesenberry
03/21/2026
PLAN_PR_49_54.md

# PLAN_PR: Samples 49-54

## Title
Samples 49-54 planning pass for sprite maturity, animation refinement, physics, collision resolution, tile metadata, and NES-style scrolling zones.

## Goal
Define the exact build order and engine/sample contracts for the next six samples without writing production code yet. This plan keeps the repo on the locked path:

`PLAN_PR -> BUILD_PR -> APPLY_PR`

## Why this phase is next
Samples 43-48 already prove image rendering, camera systems, tilemaps, input mapping, serialization, and a playable tile-camera-sprite slice. The next gap is not basic capability. The gap is maturity:
- real image-backed actor rendering as the standard path
- animation state behavior that is predictable
- movement physics that feel game-ready
- collision resolution that behaves well at corners
- tile metadata beyond simple solid/not-solid
- camera behavior closer to NES-style zone transitions and layered depth

## Current repo baseline used for this plan
- `samples/sample43-sprite-atlas-image-rendering/`
- `samples/sample44-camera-system/`
- `samples/sample45-tilemap-system/`
- `samples/sample46-input-action-mapping/`
- `samples/sample47-world-serialization/`
- `samples/sample48-tile-camera-sprite-slice/`

These samples are treated as the proof base for 49-54.

## Locked constraints
- No game layer yet
- No new `games/` work
- No engine bypasses from samples
- Sample structure must continue to match the Sample01 pattern
- New files must use the required file header standard
- Keep deltas surgical: one build step per PR when implementation begins

## Planned order
1. **49 - Real Sprite Rendering**
2. **50 - Animation System**
3. **51 - Physics System**
4. **52 - Collision Resolution**
5. **53 - Tile Metadata**
6. **54 - NES-style scrolling zones + parallax**

This order matters because each step becomes the proof base for the next one.

---

# Sample 49 - Real Sprite Rendering

## Purpose
Turn image-backed rendering into the default practical actor path instead of a partial or isolated demo path.

## Problem it solves
Sample43 proves atlas/image rendering, but later playable samples still need a stronger “real sprite as standard actor representation” contract.

## Scope
- Promote a clean actor sprite rendering path usable by later samples
- Render player and at least one non-player actor from image-backed sprites
- Keep fallback/proxy rendering only where helpful for debugging, not as the main presentation path
- Make sprite source configuration explicit and reusable

## Engine touchpoints
- render/
- assets/
- sprite atlas/image loading path already present in repo

## Expected sample proof
- A small scene with movement and camera where actor visuals are real image sprites
- Clear separation between actor state and sprite render selection
- No direct `ctx` usage in sample code

## Non-goals
- No advanced animation graph yet
- No physics changes yet
- No tile metadata changes yet

## Acceptance criteria
- Sample49 runs from the browser like existing samples
- Actor visuals are image-backed, not color-box primary placeholders
- Sprite selection is data-driven enough to be reused by Sample50
- README explains what became standard after Sample49

---

# Sample 50 - Animation System

## Purpose
Add predictable frame timing, loop control, and transition behavior on top of Sample49’s real sprite path.

## Problem it solves
Current animation proof exists, but later gameplay-facing samples need stronger timing and state transition behavior.

## Scope
- Frame timing per animation
- Looping/non-looping behavior
- Controlled transition between idle, move, and one-shot states
- Decouple animation state from raw input polling as much as possible

## Dependencies
- Requires Sample49 sprite path

## Engine touchpoints
- animation/
- render/
- state or systems layer where appropriate

## Expected sample proof
- Player can move and swap between idle and movement animation
- One-shot animation path exists for an action state or test trigger
- Transition rules are visible and stable

## Non-goals
- No full combat/state machine system rewrite
- No physics tuning yet
- No slope/hazard tile logic yet

## Acceptance criteria
- Animation speed is stable across frame rates
- Idle/move transitions do not flicker or reset incorrectly
- At least one non-looping animation completes correctly
- README explains timing, loop, and transition rules

---

# Sample 51 - Physics System

## Purpose
Move from direct position nudging toward a reusable movement model based on velocity, acceleration, and friction.

## Problem it solves
Movement can be functional without being mature. This sample makes actor motion feel more game-ready and creates a clean base for better collision response.

## Scope
- Velocity
- Acceleration
- Friction/drag
- Tunable movement constants
- Separation between intent input and movement integration

## Dependencies
- Benefits from Sample50, but should still keep its scope on motion rather than animation polish

## Engine touchpoints
- systems/
- ecs/
- movement or physics-related engine modules

## Expected sample proof
- Responsive movement with acceleration and deceleration
- Optional debug text or overlay showing velocity
- Motion values integrated in a reusable way rather than sample-only hacks

## Non-goals
- No slope rules yet
- No complex collision resolution redesign yet
- No camera zone work yet

## Acceptance criteria
- Motion is frame-rate stable
- Tuning values are easy to find and adjust
- Sample code does not embed reusable physics logic that belongs in engine/
- README explains constants and integration order

---

# Sample 52 - Collision Resolution

## Purpose
Improve collision response so movement feels cleaner at walls, corners, and slide cases.

## Problem it solves
Basic collision can stop penetration, but game-feel breaks down when actors snag on corners or stop unnaturally.

## Scope
- Sliding response along collision surfaces
- Better corner handling
- Cleaner position correction rules
- Clear order between movement integration and collision resolution

## Dependencies
- Requires Sample51 physics-based motion

## Engine touchpoints
- collision/
- tilemap/
- systems/

## Expected sample proof
- Actor can move into walls and slide along them without sticky behavior
- Corner cases are visibly improved compared with prior sample behavior
- Debug support can be shown if already available, but is not the feature itself

## Non-goals
- No slopes yet
- No hazards/triggers yet
- No camera zone logic yet

## Acceptance criteria
- Reduced corner snagging
- Stable separation after collision correction
- Repeatable behavior when approaching walls diagonally
- README documents the resolution order and constraints

---

# Sample 53 - Tile Metadata

## Purpose
Extend tilemaps beyond solid/not-solid into richer tile-driven gameplay data.

## Problem it solves
The tilemap system can render and collide, but later gameplay proof needs metadata such as hazards, triggers, and slope descriptors.

## Scope
- Tile metadata structure
- Hazard tiles
- Trigger tiles
- Placeholder slope metadata format, even if full slope movement remains limited in this pass
- Data-driven world example that demonstrates metadata use

## Dependencies
- Builds on Sample45 tilemap system and benefits from Sample52 collision maturity

## Engine touchpoints
- tilemap/
- persistence/
- data-driven world loading path

## Expected sample proof
- At least one tile type causes a hazard-style response
- At least one tile type triggers a message/event/flag
- Metadata is stored with a clear schema, not ad hoc checks scattered through scene logic

## Non-goals
- No full scripted event framework
- No large content editor
- No full slope physics unless naturally minimal and stable

## Acceptance criteria
- Metadata schema is documented
- World/sample data demonstrates at least hazard and trigger tiles
- Logic for reading metadata is reusable and not duplicated in scene code
- README shows the data format and behavior mapping

---

# Sample 54 - NES-Style Scrolling Zones + Parallax

## Purpose
Prove classic console-style camera behavior with deliberate zone transitions and layered depth.

## Problem it solves
A free camera is useful, but NES-style presentation often uses constrained zone logic, cleaner room/segment transitions, and simple depth layering.

## Scope
- Scrolling zones or camera bounds that emulate classic side-scroller/screen-section behavior
- Parallax background layers
- Demonstrate when camera follows freely and when it is constrained by zone rules
- Keep implementation sample-first and readable

## Dependencies
- Benefits from Samples49-53 being in place because the scene should look and feel more complete

## Engine touchpoints
- camera/
- render/
- tilemap/
- possibly state or scene utilities

## Expected sample proof
- A small multi-zone level or room chain
- Visible parallax layer movement
- Camera movement that reads as intentional NES-inspired behavior rather than generic smooth follow only

## Non-goals
- No full game production level
- No large asset/content pipeline expansion
- No retro hardware emulation claims

## Acceptance criteria
- Zone transitions are readable and stable
- Parallax layers move consistently relative to camera/world
- Camera constraints are easy to understand from the code
- README explains the zone model and parallax rules

---

# Cross-sample contracts

## Rendering contract
- Samples keep using renderer entry points only
- Sprite/image rendering remains the display path after Sample49
- Any debug drawing stays clearly secondary

## Input contract
- Action input remains the preferred gameplay path
- Samples do not embed DOM event handling

## Scene contract
Every sample continues to honor:
- `constructor`
- `init(engine)`
- `update(dt, engine)`
- `render(renderer, engine)`
- `dispose(engine)`

## Data ownership contract
- Reusable logic goes to `engine/`
- Sample-only setup and teaching code stays in `samples/`
- Reuse detected twice means promotion candidate to engine

---

# Recommended implementation PR sequence

## PR 1
**BUILD_PR: Sample49 only**
- real sprite rendering
- no animation system rewrite yet

## PR 2
**BUILD_PR: Sample50 only**
- animation timing, loops, transitions

## PR 3
**BUILD_PR: Sample51 only**
- physics/motion integration

## PR 4
**BUILD_PR: Sample52 only**
- collision resolution refinement

## PR 5
**BUILD_PR: Sample53 only**
- tile metadata and sample proof

## PR 6
**BUILD_PR: Sample54 only**
- camera zones and parallax

This keeps every build reviewable and aligned with your one-purpose-per-PR rule.

---

# Risks to watch
- letting Sample49 become an animation rewrite
- putting reusable physics logic inside a sample instead of engine/
- mixing collision resolution and tile metadata into one PR
- building parallax before camera zone behavior is clearly defined
- hiding important contracts in scene code instead of documenting them

# Explicit non-goals for this planning pass
- no code implementation in this PR
- no retroactive rewrite of all existing samples
- no game bootstrap work
- no large art pipeline decision beyond what Sample49 needs
- no repo-wide restructuring

# Recommended next command
`build 49`
