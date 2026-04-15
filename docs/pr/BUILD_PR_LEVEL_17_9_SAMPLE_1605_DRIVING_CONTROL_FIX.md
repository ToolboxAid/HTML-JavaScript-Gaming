# BUILD PR: 17.9 Sample 1605 Driving Control Fix

## Purpose
Fix the behavioral defect in Sample 1605 - 3D Driving Sandbox where navigation gets stuck turning left or right.

## Observed Runtime Symptom
- sample loads
- 3D renders
- driving controls are not correct
- turning appears to stick on left/right instead of behaving like normal held-input steering

## Scope
Surgically correct 1605 driving input/state behavior only.

## In Scope
- samples/phase-16/1605/DrivingSandbox3DScene.js
- minimal targeted test update if needed
- docs/dev/reports/* validation updates

## Out of Scope
- no changes to 1606-1608 unless a truly shared safe helper defect is proven
- no engine-wide input changes
- no 2D or networking changes
- no repo-wide scanning
- no zip output from Codex

## Likely Failure Areas To Inspect
- left/right turn state not clearing when key is released
- one-sided steering accumulator not recentering
- input polling using stale state
- mutually exclusive left/right handling not resolved correctly
- heading/turn velocity damping missing or sign-clamped incorrectly

## Required Fix Direction
Implement the smallest valid correction so:
- left turn works while held
- right turn works while held
- steering stops when released
- opposite direction can be engaged immediately
- forward/reverse behavior remains intact

## Acceptance Criteria
- [ ] 1605 no longer sticks turning left
- [ ] 1605 no longer sticks turning right
- [ ] steering responds correctly to press/hold/release
- [ ] forward/reverse still function
- [ ] sample remains visible and playable
- [ ] targeted Phase 16 sanity still passes where affected
- [ ] no 2D regression introduced
- [ ] no networking regression introduced

## Validation
- targeted behavioral check for 1605 steering release/reset
- targeted smoke for 1605
- update docs/dev/reports/change_summary.txt
- update docs/dev/reports/validation_checklist.txt
