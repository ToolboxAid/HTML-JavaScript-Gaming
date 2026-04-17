MODEL: GPT-5.3-codex
REASONING: high

Execute BUILD_PR_TILE_UV_WINDING_NORMAL_FIX_VALIDATION.

Goal:
Fix the tile rendering defect affecting tiles 1706 and 1707.

Required investigation:
- inspect tile mesh generation
- inspect UV mapping for top and side faces
- inspect triangle winding order
- inspect normals
- inspect any post-mesh transform that may be rotating tiles 180 degrees

Required behavior:
1. Confirm the actual root cause before changing code.
2. If UV orientation is wrong, apply only the exact UV correction required.
3. If winding is reversed, correct the index/vertex order consistently.
4. If normals are inward, correct them.
5. If a transform stage is rotating the tile incorrectly, fix that exact stage.
6. Use temporary diagnostics only if necessary to isolate the issue.
7. Do not leave debug rendering changes in the final result.
8. Re-validate with normal backface culling enabled.

Constraints:
- no broad renderer refactor
- no unrelated cleanup
- keep scope tightly limited to this defect
- preserve existing behavior for unaffected tiles

Required reports:
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree.txt
- docs/dev/reports/root_cause_notes.txt

Packaging:
- output final ZIP to:
  <project folder>/tmp/BUILD_PR_TILE_UV_WINDING_NORMAL_FIX_VALIDATION.zip
