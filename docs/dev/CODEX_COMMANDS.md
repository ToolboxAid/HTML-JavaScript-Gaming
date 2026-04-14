MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_01_SCENE_SCENES_BOUNDARY_NORMALIZATION`.

Implement one clear scene boundary decision:

1. Do NOT keep both `scene` and `scenes` as competing top-level engine concepts when they overlap.
2. Prefer `src/engine/scene/` as the single engine domain boundary.
3. Treat plural "scenes" as content collections/instances owned by games or samples where appropriate, not as a competing engine boundary.
4. Normalize imports/exports to that one truth.
5. Keep ownership clear:
   - engine owns reusable scene runtime logic only
   - game/sample-specific scene content stays in its owning layer unless truly reusable
6. Keep the changes surgical.
7. Update roadmap/status only if needed and only by status markers or additive truth-safe structure clarification.
8. Validate:
   - imports remain green
   - no duplicate scene/scenes top-level ambiguity remains
   - engine scene ownership is clearer
   - section 1 residue is reduced or closed truthfully

Final packaging step is REQUIRED:
`<project folder>/tmp/BUILD_PR_LEVEL_01_SCENE_SCENES_BOUNDARY_NORMALIZATION.zip`

Hard rules:
- implementation by Codex
- surgical changes only
- no unrelated repo changes
- no missing ZIP
