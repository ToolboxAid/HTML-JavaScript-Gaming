MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION as a docs-first implementation plan follow-up for the HTML-JavaScript-Gaming repo.

Requirements:
- Use docs/dev/RECONCILIATION_LAYER_SPEC.md, docs/dev/STATE_TIMELINE_SPEC.md, and docs/dev/DEBUG_SURFACE_CONTRACT.md as source guidance.
- Preserve current repo workflow conventions.
- Do not modify engine core APIs.
- Do not add server-dashboard, docker, or transport implementation.
- Keep Sample C as a consumer/proving ground, not the shared implementation itself.
- Normalize any proposed interfaces around approved public selectors/events only.
- Prefer sample-level layering and bounded history buffers.
- Future-proof naming away from sample-specific ad hoc wiring.
- Package outputs as a repo-structured ZIP at:
  HTML-JavaScript-Gaming/tmp/BUILD_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION_delta.zip

Expected outputs:
- docs/pr/BUILD_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION.md
- docs/dev/reports/file_tree.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/commit_comment.txt

Do not write implementation code unless explicitly required by the build instructions. Keep this bundle docs/planning only.
