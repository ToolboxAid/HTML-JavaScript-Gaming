Toolbox Aid
David Quesenberry
04/05/2026
asteroids_showcase_maintainer_notes.md

# Asteroids Showcase Maintainer Notes

## Integration Boundary
- Keep integration at game/sample composition level.
- Do not move Asteroids-specific debug behavior into engine core.
- Reuse public debug APIs from `tools/dev/devConsoleIntegration.js`.

## Asteroids-Specific Debug Module
- `games/Asteroids/debug/asteroidsShowcaseDebug.js`

Responsibilities:
- register Asteroids showcase panels
- register Asteroids showcase commands
- apply Asteroids showcase presets

## Scene Telemetry Contract
`AsteroidsGameScene` publishes diagnostics context with:
- session state (mode, score, lives, wave, status)
- entity state (ship, bullets, asteroids, UFO)
- recent event stream

## Extension Guidance
If another sample wants the same productization pattern:
1. keep gameplay logic unchanged
2. add optional debug config in sample boot
3. pass optional debug integration into the scene
4. publish sample-specific diagnostics context
5. keep event streams bounded

## Non-Goals
- no Track G network scope
- no Track H 3D scope
- no unrelated engine architecture changes
