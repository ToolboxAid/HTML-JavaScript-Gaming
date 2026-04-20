MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_SAMPLES_INDEX_FILTER_AND_PHASE_LIST_RESTORE

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_SAMPLES_INDEX_FILTER_AND_PHASE_LIST_RESTORE.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only if execution-backed status changes are earned
- no embedded <style> blocks
- no inline style=""
- no JS-generated styling
- keep scope limited to /samples/index.html and directly related shared dependencies only

Required work:
1. Restore the filter UI on /samples/index.html if missing or hidden.
2. Restore rendering of all phases on /samples/index.html.
3. Verify filtering works correctly after restoration.
4. Preserve the shared header/body consistency behavior.
5. Keep the change narrow, testable, and behavior-restoring rather than redesigning.
