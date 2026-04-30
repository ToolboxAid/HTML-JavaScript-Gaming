# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

STRICT SCOPE MODE

ALLOWED FILES:
- toolHostRuntime.js
- docs/dev/reports/current_route_closeout_11_141.txt

ALLOWED CHANGES:
- only direct route closeout
- only toolHostRuntime.js if needed
- create/update the report

TASK:

1. Inspect `toolHostRuntime.js`.

2. Confirm `validateInput` only checks:
   - payloadJson is plain object
   - paletteJson is null or plain object

3. Remove only from `toolHostRuntime.js` if still present:
   - wrapper detection
   - parent JSON detection
   - fallback scanning
   - implicit/global key scanning
   - mutation fingerprint checks

4. Do NOT perform repo-wide fallback cleanup.
   - There are 610 fallback matches across 133 files.
   - This is known debt and intentionally out of scope.

5. Validate:
   - syntax check `toolHostRuntime.js`
   - git diff --name-only
   - ensure changed files are only ALLOWED FILES

6. Write:
   docs/dev/reports/current_route_closeout_11_141.txt

Report must include:
- files changed
- final validateInput behavior
- validation command/result
- note that repo-wide fallback debt is deferred
- confirmation strict scope respected

7. Package Codex output ZIP at:
   tmp/PR_11_141_CLOSE_CURRENT_DIRECT_JSON_ROUTE.zip
