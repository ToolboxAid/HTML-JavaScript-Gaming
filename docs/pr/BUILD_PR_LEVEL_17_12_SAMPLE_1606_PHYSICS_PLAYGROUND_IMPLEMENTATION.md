# BUILD PR: 17.12 Sample 1606 Physics Playground Implementation

## Purpose
Implement a real, testable improvement to Sample 1606 so the physics playground is visually obvious, educational, and clearly advances the Phase 16 roadmap.

## Why This PR Exists
The prior docs-only package was not valid for this workflow because it did not guarantee a runtime change.
This PR corrects that by requiring a visible implementation.

## Scope
Implement a real Sample 1606 improvement only:
- stronger visible gravity
- readable bounce response
- clear multi-object motion/collision behavior
- immediate visual cause/effect for learning

## In Scope
- samples/phase-16/1606/PhysicsPlayground3DScene.js
- sample-local helpers only if required
- tests/runtime/Phase16VisibilitySanity.test.mjs (targeted extension only if useful)
- docs/reports/change_summary.txt
- docs/reports/validation_checklist.txt

## Out of Scope
- no engine-wide physics rewrite
- no changes to 1601-1605 or 1607-1608 unless a truly shared safe fix is proven
- no 2D changes
- no networking changes
- no repo-wide scanning
- no zip output from Codex

## Required Runtime Result
Sample 1606 must visibly teach physics, not merely technically simulate it:
1. falling objects clearly accelerate
2. bounce is obvious and easy to read
3. at least two or more bodies show distinct motion/interaction
4. motion settles or loops in a way the user can understand
5. the scene remains visible and immediately interpretable on first load

## Suggested Implementation Direction
Use the smallest valid implementation that creates obvious learning value:
- exaggerate gravity compared with current subtle motion
- increase bounce readability
- use clearly separated starting positions/heights
- preserve stable rendering and camera readability
- prefer clarity over realism

## Acceptance Criteria
- [ ] 1606 loads and renders visible 3D content
- [ ] gravity is visually obvious on first load
- [ ] bounce is clearly visible
- [ ] multiple objects demonstrate distinct motion/interaction
- [ ] the sample reads as a physics playground without extra explanation
- [ ] targeted Phase 16 sanity passes where affected
- [ ] targeted smoke for 1606 passes
- [ ] no 2D regression introduced
- [ ] no networking regression introduced

## Validation
- targeted behavioral/runtime check for 1606
- targeted smoke for 1606
- update docs/reports/change_summary.txt
- update docs/reports/validation_checklist.txt
