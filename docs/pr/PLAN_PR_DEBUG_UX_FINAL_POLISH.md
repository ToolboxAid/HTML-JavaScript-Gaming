Toolbox Aid
David Quesenberry
04/05/2026
PLAN_PR_DEBUG_UX_FINAL_POLISH.md

# PLAN_PR_DEBUG_UX_FINAL_POLISH

## Goal
Finalize debug UX consistency across Asteroids and Breakout without changing engine core behavior.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Finalize debug ON/OFF badge behavior.
- Finalize default preset auto-load behavior.
- Finalize `Open Debug Panel` consistency.
- Finalize inline mini help consistency.
- Evaluate and define remembered debug state behavior.
- Evaluate and define one-click demo mode behavior.

## Target Samples
- `games/Asteroids`
- `games/Breakout`

## Behavior Contract
1. Production-safe default remains OFF unless explicitly enabled by URL/local development defaults.
2. Both samples expose the same debug UX surface:
- `Debug: ON/OFF` badge
- `Open Debug Panel` button
- two-line mini help region
3. Default preset auto-load runs only when debug is enabled.
4. Remembered debug state is optional and explicit via `rememberDebug=1`.
5. One-click demo mode is optional and explicit via `debugDemo=1`.
6. Demo mode enables debug, applies default preset, and opens debug surfaces.

## Guardrails
- Sample-level integration only.
- No engine core changes.
- Do not modify `docs/dev/BIG_PICTURE_ROADMAP.md`.
- If `docs/dev/PRODUCTIZATION_ROADMAP.md` changes, bracket-only edits only.
- No Track G or Track H work.

## Acceptance Criteria
- Asteroids and Breakout share consistent badge/button/help behavior.
- Preset auto-load behavior is predictable and aligned.
- Remembered state and demo mode are explicit optional flows.
- Production-safe defaults preserved.