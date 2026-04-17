MODEL: GPT-5.3-codex
REASONING: high

Execute BUILD_PR_PREVIEW_PATH_CONTRACT_REALIGNMENT.

Goal:
Repair preview path resolution after the sample structure changed.

Required changes:
- inspect `tools/preview`
- update sample resolution to the current contract:
  `<phase>-<xx>/<xxxx>/index.html`
- inspect any preview-related references to `samples/shared`
- if such references exist, update them to the current `tools/preview` contract or remove them if obsolete
- keep scope tightly limited to preview-path repair

Constraints:
- do not perform unrelated cleanup
- do not rewrite roadmap text
- do not modify start_of_day folders
- preserve existing preview behavior outside the path fix
- produce validation-backed results

Deliverables to populate:
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree.txt

Packaging:
- output final ZIP to:
  <project folder>/tmp/BUILD_PR_PREVIEW_PATH_CONTRACT_REALIGNMENT.zip
