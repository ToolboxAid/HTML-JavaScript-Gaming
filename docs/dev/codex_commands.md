MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_20_1_TOOL_SAMPLE_DROPDOWN_FOUNDATION as a one-pass, testable PR in the HTML-JavaScript-Gaming repo.

Constraints:
- fullscreen is complete; do not modify fullscreen behavior
- docs-first repo workflow
- one PR purpose only: sample packs + dropdown loading
- active tools only:
  - tools/Tile Map Editor
  - tools/Parallax Editor
  - tools/Vector Map Editor
  - tools/Vector Asset Studio
- 3 shipped samples per active tool
- sample data must live in each tool's local samples structure
- each tool must expose a Sample dropdown and be able to load all 3 samples
- preserve manual editing flows
- no repo-wide scanning unless required
- no destructive cleanup
- do not modify start_of_day folders
- keep legacy preserved paths intact unless strictly required
- update roadmap status only in docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md
- no roadmap rewrites; status-only changes unless explicit additive line is required

Required outputs:
- implementation changes for dropdown sample loading in all 4 active tools
- tool-local sample files/assets/manifests as needed
- docs/pr/BUILD_PR_LEVEL_20_1_TOOL_SAMPLE_DROPDOWN_FOUNDATION.md aligned to delivered work
- docs/dev/reports/change_summary.txt
- docs/dev/reports/file_tree.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/commit_comment.txt
- package final artifact to:
  <project folder>/tmp/BUILD_PR_LEVEL_20_1_TOOL_SAMPLE_DROPDOWN_FOUNDATION.zip

Validation target:
- open each tool
- verify dropdown visible
- verify exactly 3 samples per tool
- verify each sample loads and visibly changes content
- verify no fullscreen regression
