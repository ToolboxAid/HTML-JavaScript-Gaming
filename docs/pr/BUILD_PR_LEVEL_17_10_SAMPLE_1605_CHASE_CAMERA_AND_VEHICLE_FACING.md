# BUILD PR: 17.10 Sample 1605 Chase Camera And Vehicle Facing

## Purpose
Improve Sample 1605 readability as a driving sample by making the driven object clearly face its heading and keeping the camera behind the vehicle.

## Why This PR Exists
The current 1605 sample may now accept steering correctly, but it still reads poorly as a driving sandbox because:
- the driven object can feel visually disconnected from heading
- the camera can lose the vehicle
- navigation feels less like driving and more like free movement in 3D space

A driving sample should prioritize orientation clarity over camera experimentation.

## Scope
Surgically improve Sample 1605 only:
- make the driven box/vehicle clearly rotate to match heading
- keep the camera behind the driven object by default
- preserve existing visible 3D output and current steering fix
- keep the sample simple and readable

## In Scope
- samples/phase-16/1605/DrivingSandbox3DScene.js
- minimal targeted sanity extension if needed
- docs/dev/reports/* validation updates

## Out of Scope
- no changes to 1601-1604 or 1606-1608 unless a truly shared safe defect is proven
- no engine-wide camera abstraction work
- no advanced vehicle physics rewrite
- no 2D or networking changes
- no repo-wide scanning
- no zip output from Codex

## Desired Behavior
- left/right steering changes vehicle heading
- the driven object visually turns with heading
- camera follows from behind the driven object
- camera framing remains stable enough that the player does not lose the vehicle during normal driving
- forward/reverse remain usable
- the sample remains a simple teaching sample, not a full racer

## Required Fix Direction
Implement the smallest valid correction:
1. align rendered vehicle orientation with movement heading
2. place/update camera as a chase camera behind the heading vector
3. keep a readable height and distance offset
4. ensure the vehicle remains visible during turning and reversing
5. preserve current steering release behavior

## Acceptance Criteria
- [ ] the box/vehicle visibly turns with heading
- [ ] the camera stays behind the driven object during normal driving
- [ ] the vehicle remains easy to track during turning
- [ ] forward/reverse still function
- [ ] steering still behaves correctly after the prior fix
- [ ] sample remains visible and playable
- [ ] targeted Phase 16 sanity still passes where affected
- [ ] no 2D regression introduced
- [ ] no networking regression introduced

## Validation
- targeted behavioral check for 1605 heading + chase camera behavior
- targeted smoke for 1605
- update docs/reports/change_summary.txt
- update docs/reports/validation_checklist.txt
