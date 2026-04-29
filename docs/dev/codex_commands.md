MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 11.24.

Find the sample 1902 page/content that renders the visible "Tool Roundtrip Links" section and individual "Open <tool>" links.

Make the smallest targeted change so sample 1902 exposes only:

Open with Workspace Manager

Do not modify tool implementation files unless the sample entry page delegates rendering there.
Do not change payload schema.
Do not change manifest data except where required to remove direct visible sample links.
Do not add fallback links.
Do not touch start_of_day folders.

VALIDATION:
node --check <changed-js-files>
node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools

REPORT:
Write docs/dev/reports/PR_11_24_validation.txt with:
- changed files
- before behavior
- after behavior
- validation commands/results
