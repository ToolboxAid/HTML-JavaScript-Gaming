Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ENGINE-STABILIZATION-PHASE1-SCENE-LIFECYCLE-AND-TRANSITION-SEAMS. Fix engine scene replacement so outgoing scenes receive exit() and incoming scenes receive enter() exactly once, aligned with the intended scene lifecycle contract. Remove raw renderer.ctx dependence from engine/scenes/TransitionScene.js without broadening renderer responsibilities. Add focused engine/scene tests for lifecycle correctness and transition seam behavior. Do not change persistence, ParticleSystem, Asteroids extraction, gameplay, or unrelated files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that scene replacement is lifecycle-correct, TransitionScene no longer depends on raw renderer.ctx, focused engine/scene tests were added, and no unrelated subsystems changed.
