Level 10.7 BUILD_PR implementation package.

Contents:
- docs/pr/BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT.md
- docs/pr/LEVEL_10_7_IMPLEMENTATION_SCOPE_AND_GATES.md
- docs/pr/LEVEL_10_7_MODULE_PUBLIC_API.md
- docs/pr/LEVEL_10_7_OPTIONAL_CONSUMER_PILOT.md
- docs/pr/LEVEL_10_7_VALIDATION_AND_ROLLOUT.md
- samples/shared/worldGameStateSystem.js
- tests/world/WorldGameStateSystem.test.mjs
- tests/run-tests.mjs
- docs/dev/CODEX_COMMANDS.md
- docs/dev/COMMIT_COMMENT.txt
- docs/dev/NEXT_COMMAND.txt
- docs/dev/README.md

Notes:
- Runtime implementation is contract-only and passive-mode-first.
- No engine core APIs were modified.

Codex output requirement:
- Return a repo-structured delta ZIP at:
  <project>/tmp/BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT_delta.zip
