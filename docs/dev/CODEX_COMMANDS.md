MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_01_RENDERING_VECTOR_BOUNDARY_AND_PHYSICS_CLOSEOUT`.

Implement this as one combined section-1 closeout PR.

Boundary decisions:
1. `VectorDrawing` belongs in rendering.
2. `VectorMath` belongs in shared math/utility.
3. `src/engine/physics` must contain real reusable physics helpers, not just placeholder/barrel status.

Required work:
1. Move/normalize vector drawing:
   - place `VectorDrawing` under the appropriate rendering-owned path
   - update imports/exports accordingly

2. Move/normalize vector math:
   - place `VectorMath` under the appropriate shared math/utility path
   - update imports/exports accordingly

3. Close physics truthfully:
   - extract the smallest valid set of reusable physics-domain helpers from existing games/samples into `src/engine/physics`
   - examples may include gravity, friction, drag, acceleration/integration, bounce/impulse if already stable
   - do NOT promote game-specific behavior prematurely
   - keep the extraction surgical

4. Validate:
   - imports remain green
   - post-move validation remains green
   - rendering no longer owns generic vector math
   - shared math no longer depends on rendering
   - `src/engine/physics` now contains real reusable physics helpers

5. Roadmap:
   - update status markers only
   - no roadmap text rewrite
   - mark `src/engine/rendering` and `src/engine/physics` complete only if truthfully supported
   - leave `src/engine/scene` open if it still is not done

6. Final packaging step is REQUIRED:
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_01_RENDERING_VECTOR_BOUNDARY_AND_PHYSICS_CLOSEOUT.zip`

Hard rules:
- implementation by Codex
- surgical changes only
- no unrelated repo changes
- no missing ZIP
