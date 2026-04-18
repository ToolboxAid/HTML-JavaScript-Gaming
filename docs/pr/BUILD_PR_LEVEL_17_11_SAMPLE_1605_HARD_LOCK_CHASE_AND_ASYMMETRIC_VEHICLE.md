# BUILD PR: 17.11 Sample 1605 Hard-Lock Chase And Asymmetric Vehicle

## Purpose
Fix Sample 1605 so the vehicle heading is unmistakable and the camera cannot drift away from the driven object.

## Why This PR Exists
The prior 1605 update still fails real user validation:
- the box does not read as turning
- the camera still gets lost
- automated checks pass, but the sample remains behaviorally wrong by human inspection

That means the sample needs a stronger visible/readability correction, not another soft camera tuning pass.

## Scope
Surgically fix Sample 1605 only by:
- replacing ambiguous symmetric vehicle visuals with an obviously front-facing asymmetric vehicle shape
- hard-locking the camera to a behind-vehicle chase position
- making the sample readable first, even if the camera behavior is simpler than a polished racer

## In Scope
- samples/phase-16/1605/DrivingSandbox3DScene.js
- targeted runtime sanity update if needed
- docs/dev/reports/* validation updates

## Out of Scope
- no changes to 1601-1604 or 1606-1608
- no engine-wide camera abstraction
- no advanced vehicle physics
- no repo-wide scanning
- no zip output from Codex
- no 2D or networking changes

## Required Fix Direction
Implement the smallest valid correction that the user can clearly see:
1. render the vehicle with a distinctly directional shape, not a visually symmetric cube
2. include a strong front indicator that rotates with heading
3. hard-lock the camera behind the heading vector every frame
4. keep the camera aimed at the vehicle every frame
5. remove or minimize yaw lag/interpolation if it reduces readability
6. preserve existing steering and forward/reverse behavior

## Desired Runtime Result
- when steering left/right, the vehicle visibly changes facing
- the front of the vehicle is obvious at a glance
- the camera stays behind the vehicle and does not wander off
- the player can always re-orient immediately

## Acceptance Criteria
- [ ] the vehicle is visibly asymmetric and front-facing
- [ ] the front indicator rotates with heading
- [ ] the camera is hard-locked behind the vehicle
- [ ] the camera remains aimed at the vehicle
- [ ] the vehicle stays easy to track during turning
- [ ] steering still behaves correctly
- [ ] forward/reverse still function
- [ ] sample remains visible and playable
- [ ] targeted smoke for 1605 passes
- [ ] no 2D regression introduced
- [ ] no networking regression introduced

## Validation
- targeted behavioral check for 1605 heading readability and chase-camera lock
- targeted smoke for 1605
- update docs/reports/change_summary.txt
- update docs/reports/validation_checklist.txt
