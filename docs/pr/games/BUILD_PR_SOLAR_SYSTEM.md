Toolbox Aid
David Quesenberry
03/24/2026
BUILD_PR_SOLAR_SYSTEM.md

# BUILD_PR — Solar System

## Goal
Build Solar System as a game-track Physics Systems entry under games/, not samples/.

This PR should create a simplified, readable simulation of our solar system with:
- Sun
- planets
- selected moons
- stable scaled orbital motion
- pause/reset/time controls
- optional label toggle for names
- clean minimal presentation

## Critical Placement Rule
This PR MUST create its files under:

games/SolarSystem/

Do NOT place this under samples.
Do NOT treat this as a sample-track item.
This belongs under the games track.

## Why This Is a Game
This is not a single isolated teaching mechanic.
It is a broader system experience with:
- multiple celestial bodies
- persistent system-wide motion
- user-facing controls
- visual exploration

That makes it a game-track Physics Systems entry, even if it is not score-based.

## Scope
Include:
- Sun
- 8 planets
- selected moons for recognition and readability

### Recommended moon scope
Start with a curated set:
- Earth -> Moon
- Jupiter -> Io, Europa, Ganymede, Callisto
- Saturn -> Titan

Optional only if already clean:
- Mars -> Phobos, Deimos
- Uranus / Neptune moons

Keep it readable.

## Simulation Style
Use scripted orbital tracks / simplified orbital motion, not full n-body gravity.

Why:
- more stable
- more readable
- easier to tune
- better for first-pass solar system presentation
- avoids numerical chaos and scale distortion

So:
- bodies move on predefined scaled ellipse/circle-like paths
- moons orbit around parent planets
- time scaling controls speed

Prioritize recognizability, stability, and clarity over astrophysical precision.

## Visual Style
Keep it clean and classic.

### Rules
- black background
- simple colored bodies
- optional thin orbit rings
- labels only when toggled on
- no modern control panels
- no decorative space backgrounds
- no glow spam
- no visual clutter

### Body treatment
- Sun: simple bright circle
- planets: distinct solid-color circles
- moons: smaller circles
- orbit lines: thin muted strokes

## Controls

### Keyboard
- P = pause / resume
- R or Space = reset
- [ / ] or - / = = slower / faster time scale
- L = toggle labels (Sun, planets, included moons)

Do NOT use Escape for pause.

### Gamepad (optional)
- Start = pause / resume
- South button = reset
- Shoulder buttons = slower / faster time scale
- X / Y or similar = toggle labels

## Label Toggle Requirement
Allow users to toggle visibility of body names, similar to label reveal behavior used in samples.

### Default state
- labels OFF

### When toggled ON
Show:
- Sun label
- planet names
- included moon names

### Label style rules
- simple text only
- small readable font
- white or slightly muted color
- offset near body to avoid overlap
- no boxes
- no glow
- no modern UI framing

## Camera / View
### First pass recommendation
Use a single fixed view:
- Sun centered
- orbits scaled to fit
- readable layout over realism

Optional later:
- focus per planet
- zoom/pan

Do not add those in this PR unless already trivial.

## Architecture

### Scene
Single scene:
- SolarSystemScene

### Game-local modules
Suggested:
- SolarSystemWorld.js
- SolarSystemConfig.js
- SolarSystemTimeController.js
- SolarSystemHud.js

Optional:
- SolarSystemRenderer.js if drawing gets too dense

## Data / Modeling
Use config/data for bodies.

Suggested body fields:
- name
- parent body
- orbital radius (scaled)
- orbital period (scaled)
- body radius (scaled)
- color
- initial angle

Keep this solar-system-specific config, not a generic astrophysics engine.

## Engine Touch Policy
Likely no engine changes should be needed.

Use existing engine:
- renderer
- scene lifecycle
- input
- fullscreen/theme if already standard

Audio is recommended to be omitted in first pass.

## Audio
Recommended:
- omit in first pass

A solar system visualization does not need sound to succeed.
If included later, do it in a separate refinement PR.

## File Plan

games/SolarSystem/
  index.html
  main.js
  assets/
    preview.svg
  game/
    SolarSystemScene.js
    SolarSystemWorld.js
    SolarSystemConfig.js
    SolarSystemTimeController.js
    SolarSystemHud.js

Likely updates:
- games/index.html
- docs/dev/games/SOLAR_SYSTEM.md

Possible tests:
- tests/games/SolarSystemWorld.test.mjs
- tests/games/SolarSystemValidation.test.mjs

## games/index.html Placement
Place Solar System under:

Level 2 - Forces & Motion Systems

Be explicit:
- Solar System belongs in games
- not samples
- not sample track

## Tests / Validation
Must cover:
- bodies initialize correctly
- parent/child orbital relationships remain stable
- orbital motion updates correctly over time
- reset restores initial state
- pause works with P
- time scaling works
- label toggle works with L
- no console errors

Good regression targets:
- no NaN/infinite body state
- moon positions remain relative to correct parent
- repeated pause/reset/time-scale toggles remain stable
- label toggling does not affect simulation state

## Acceptance Criteria
Done means:
- Solar System runs standalone
- files live under games/SolarSystem
- no console errors
- Sun, planets, and selected moons render
- orbital motion is stable and readable
- time scaling works
- pause/reset works with P
- labels toggle with L
- labels include Sun, planets, and included moons
- games/index.html includes it under Level 2 - Forces & Motion Systems
- tests pass
- no engine rule violations

## Non-Goals
Not in this PR:
- n-body simulation
- exact astrophysical accuracy
- every moon in the solar system
- planet surface textures
- zoomable planet detail mode
- encyclopedia text panels
- audio system expansion

Keep it focused and readable.

## Recommended Execution Order
1. scaffold games/SolarSystem
2. implement body config and orbital motion
3. add time controller
4. add pause/reset flow using P
5. add label toggle using L
6. add minimal HUD/labels
7. update games/index.html
8. add tests
9. update docs

## Commit Comment
Build Solar System under games as a physics-systems simulation

## Notes for Codex
- This belongs under games/SolarSystem, not samples
- Repeat: do NOT place this under samples
- Keep the implementation game-local and stable
- Prioritize readability over realism
- Labels must toggle on/off with L and default to OFF
