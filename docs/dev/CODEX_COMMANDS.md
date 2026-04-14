MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_01_ENGINE_VECTOR_RESIDUE_CLEANUP`.

Implement a surgical cleanup of the leftover `engine/vector/` residue.

Required work:
1. Audit the remaining contents of `engine/vector/`.
2. For each remaining item, classify it as:
   - stale residue to remove
   - real content to move to the correct modern home
   - temporary compatibility surface that must remain
3. Preferred outcome:
   - if the folder is only stale residue, remove it cleanly
   - if it contains real content, move that content first, then remove the stale shell if possible
4. Respect current boundary decisions:
   - rendering-owned vector drawing stays with rendering
   - shared math/utility-owned vector math stays in shared math/utility
5. Normalize lingering imports pointing at `engine/vector/`.
6. Validate:
   - imports remain green
   - no misleading old vector boundary remains unless a temporary compatibility reason is explicitly documented
   - section-1 truth is improved
7. Update roadmap status markers only if truthfully supported.

Final packaging step is REQUIRED:
`<project folder>/tmp/BUILD_PR_LEVEL_01_ENGINE_VECTOR_RESIDUE_CLEANUP.zip`

Hard rules:
- implementation by Codex
- surgical changes only
- no unrelated repo changes
- no missing ZIP
