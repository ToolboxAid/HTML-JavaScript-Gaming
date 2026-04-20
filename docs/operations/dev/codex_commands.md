MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_STYLE_INDEX_HEADER_AND_BODY_CONSISTENCY_FIX

Rules:
- output ONLY the final zip to:
  <project folder>/tmp/BUILD_PR_STYLE_INDEX_HEADER_AND_BODY_CONSISTENCY_FIX.zip
- do NOT create staging folders in <project folder>/tmp
- do NOT modify roadmap in the PR bundle
- Codex updates roadmap during execution only if execution-backed status changes are earned
- no embedded <style> blocks
- no inline style=""
- no JS-generated styling
- keep scope limited to:
  /index.html
  /games/index.html
  /samples/index.html
  /tools/index.html only as needed for shared consistency

Required work:
1. Treat /tools/index.html as the current good visual baseline.
2. Compare it against /index.html, /games/index.html, and /samples/index.html.
3. Normalize the three non-matching pages so the shared header stretches full width the same way.
4. Normalize the three non-matching pages so the body/theme colors match the tools page.
5. Prefer fixing shared CSS imports, body classes, and shared shell usage over ad hoc page-specific hacks.
6. Keep the change narrow, testable, and visually consistent.
