MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_SAMPLES_INDEX_DATA_DRIVEN_LIST_RESTORE

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_SAMPLES_INDEX_DATA_DRIVEN_LIST_RESTORE.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only if execution-backed status changes are earned
- no embedded <style> blocks
- no inline style=""
- no JS-generated styling
- keep scope limited to /samples/index.html and directly related sample-index data/rendering dependencies

Required work:
1. Identify the real samples index data source and render path.
2. Remove any simplified phase-to-xx01 fallback rendering that is causing the wrong output.
3. Restore phase descriptions.
4. Restore all sample entries within each phase.
5. Restore per-sample details sourced from the sample list data.
6. Restore sample pinning behavior.
7. Preserve filter behavior.
8. Preserve the shared header/body consistency work.
9. Keep the change narrow, testable, and behavior-restoring rather than redesigning.
