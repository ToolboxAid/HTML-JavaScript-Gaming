# BUILD_PR_LEVEL_17_52_DEBUG_OVERLAY_CYCLE_KEY_AND_SAMPLE_STACK_MAP

## Purpose
Replace the browser-conflicting debug overlay cycle key used in the phase-17 samples and lock the bottom-right overlay stack order to the exact sample-specific panel sets requested by the user.

## Scope
Small, surgical runtime/input/debug-overlay update only.

In scope:
- Remove `Tab` as the overlay cycle key anywhere this PR touches phase-17 debug overlay cycling.
- Introduce one non-browser-reserved replacement key for the affected phase-17 samples and keep it consistent across the touched samples.
- Keep debug panels anchored in the bottom-right corner.
- Enforce the sample-specific bottom-right panel cycle/order listed below.
- Update/add runtime tests to verify the new key path and the sample-specific bottom-right stack mapping.

Out of scope:
- Any unrelated HUD redesign.
- Any repo-wide input remap outside the touched samples.
- Any changes to start_of_day folders.

## Required input change
`Tab` must no longer be used for the overlay-cycle action in the affected phase-17 samples because the browser keeps consuming it.

Implement a single replacement key for this PR. Use a key that is not browser-reserved and is practical during gameplay/debugging. Keep the same replacement key across all touched samples and tests.

## Required layout rule
All touched debug panels must remain anchored to the bottom-right corner and stack upward from there.

## Required sample map
Apply the following bottom-right cycle map exactly.

### Samples 1708 and 1710
Cycle through these panels in this set:
1. `UI Layer`
2. `Mission Feed`
3. the existing panel whose title ends in `ADY`
4. `Mini-Game Runtime`

### Samples 1709 and 1711
Cycle through these panels in this set:
1. `Movement Runtime`
2. `Movement Lab HUD`

### Sample 1712
Cycle through these panels in this set:
1. `UI Layer`
2. `Mission Feed`
3. the existing panel whose title ends in `ADY`
4. `Telemetry Overlay`

### Sample 1713
Cycle through these panels in this set:
1. `UI Layer`
2. `Mission Feed`
3. the existing panel whose title ends in `ADY`
4. `Final Reference Runtime`

## Implementation notes for Codex
- Reuse existing debug overlay composition where possible.
- Do not rename the existing `...ADY` panel unless the current title is already wrong for another reason. The user only requires that the cycle include the current panel whose title ends in `ADY`.
- Preserve bottom-right anchoring utilities if they already exist; extend them only as needed for deterministic stacking/order.
- Keep the touched change set as small as possible.

## Files expected to change
- `samples/phase-17/1708/RealGameplayMiniGameScene.js`
- `samples/phase-17/1709/MovementModelsLabScene.js`
- `samples/phase-17/1710/RealGameplayMiniGameScene.js`
- `samples/phase-17/1711/MovementModelsLabScene.js`
- `samples/phase-17/1712/GameplayMetricsTelemetryScene.js`
- `samples/phase-17/1713/FinalReferenceGameScene.js`
- `src/engine/debug/*` only if needed for shared bottom-right stack/cycle support
- `tests/runtime/*` for deterministic key/cycle/layout coverage

## Required validation
Codex must leave a runnable test that proves:
- `Tab` is no longer the active cycle key in the touched samples.
- The replacement key advances the overlay cycle.
- Each sample exposes exactly the required panel set above.
- The rendered panel titles still land in the bottom-right stack region.
