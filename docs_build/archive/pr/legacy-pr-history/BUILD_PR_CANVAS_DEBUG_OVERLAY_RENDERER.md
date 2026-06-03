Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_CANVAS_DEBUG_OVERLAY_RENDERER.md

# BUILD PR
Canvas Debug Overlay Renderer

## Objective
Build a real visual HUD for the existing dev console/debug overlay system and wire it into one sample so the overlay renders on-canvas inside the running game.

## Scope
- Create a dedicated canvas HUD renderer file
- Wire the HUD renderer into the existing sample-level dev console integration
- Render overlay content after gameplay/world rendering
- Reuse existing overlay diagnostics and panel state from the current debug runtime
- Keep implementation isolated to tool/dev + one sample integration target

## Required Outputs
Codex must produce implementation code and the implementation delta ZIP at:
<project folder>/tmp/BUILD_PR_CANVAS_DEBUG_OVERLAY_RENDERER_delta.zip

## File Targets
Expected implementation focus:
- tools/dev/canvasDebugHudRenderer.js
- tools/dev/devConsoleIntegration.js
- one sample entry file only
- optional test file if needed for renderer validation

## Implementation Requirements

### 1. New HUD renderer
Create:
tools/dev/canvasDebugHudRenderer.js

Responsibilities:
- accept a 2D canvas context and overlay data
- render a lightweight translucent HUD panel
- draw title + section headers + line items
- support current/active panel highlighting
- support compact layout with predictable padding
- render safely even when some diagnostics are missing
- remain dependency-free

### 2. Wire into existing integration
Update:
tools/dev/devConsoleIntegration.js

Requirements:
- import canvasDebugHudRenderer.js
- keep combo-key bindings already implemented:
  - Shift + ` => toggle console
  - Ctrl + Shift + ` => toggle overlay
  - Ctrl + Shift + R => reload
  - Ctrl + Shift + ] => next panel
  - Ctrl + Shift + [ => previous panel
- expose a method that draws the HUD onto a provided canvas context
- preserve sample-safe boundaries
- do not move logic into engine core

### 3. Sample wiring
Modify ONE sample/dev entry file only.

Requirements:
- initialize integration once
- collect diagnostics in the loop
- draw world/game first
- draw debug HUD last
- ensure repeated toggles do not duplicate listeners or runtime instances

## HUD Rendering Rules
- Render last in frame order
- Default position: top-left
- Use readable mono or browser-safe default font
- Use translucent dark background
- Use contrasting text
- Keep dimensions adaptive to content
- Avoid touching gameplay transforms/camera transforms
- Use save()/restore() around canvas state mutations
- Do not assume fullscreen
- Do not require HTML DOM overlay

## Minimum Visible Content
HUD should visibly support:
- Runtime
- Frame
- Scene
- Camera
- Entities
- Render
- Tilemap
- Input
- Hot Reload
- Validation

## Non-Goals
- No engine renderer rewrite
- No DOM-based console window
- No CSS/HTML overlay framework
- No broad sample migrations
- No debug system spread across engine modules

## Acceptance Criteria
- Sample still runs normally
- Shift + ` toggles console state
- Ctrl + Shift + ` toggles HUD visibility
- HUD draws on canvas
- HUD renders after gameplay content
- Panel navigation works
- Missing diagnostics do not crash rendering
- No F-key bindings remain
- No engine core files modified

## Validation
- node --check on all touched JS files
- run sample manually
- verify HUD visible on canvas
- verify combo keys work
- verify reload combo does not browser-refresh the page
- verify panel cycling updates visible section focus
- verify no duplicate event listeners after reload/reinit

## Risks
- Canvas state leakage
- overlay drawn before game content
- integration duplicates runtime
- browser key conflict regressions

## Rollback
If instability appears:
- disable HUD draw call in sample
- keep runtime logic intact
- preserve combo key system
