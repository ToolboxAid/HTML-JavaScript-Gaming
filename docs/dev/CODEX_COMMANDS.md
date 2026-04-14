MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_01_RENDERER_RENDERING_BOUNDARY_NORMALIZATION`.

Implement one clear rendering boundary decision:

1. Do NOT keep both `renderer` and `rendering` as competing top-level engine concepts.
2. Prefer `src/engine/rendering/` as the single domain boundary.
3. Treat renderer as an implementation/class/module inside rendering, not as a separate parallel boundary.
4. Normalize imports/exports to that one truth.
5. Keep the structure simple:
   - do NOT over-split into `vector/`, `sprite/`, `layer/` unless the repo already has enough stable clustered content to justify it
   - prefer a flatter rendering boundary first
6. Update roadmap/status only if needed and only by status markers or additive truth-safe structure clarification.
7. Validate:
   - imports remain green
   - no duplicate renderer/rendering top-level ambiguity remains
   - any subfolders added are truthfully justified, not speculative

Final packaging step is REQUIRED:
`<project folder>/tmp/BUILD_PR_LEVEL_01_RENDERER_RENDERING_BOUNDARY_NORMALIZATION.zip`

Hard rules:
- implementation by Codex
- surgical changes only
- no unrelated repo changes
- no missing ZIP
