# Level 11.1 Bundle

Implementation delta for one authoritative handoff candidate.

Contents:
- docs/pr/BUILD_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE.md
- docs/pr/LEVEL_11_1_HANDOFF_CANDIDATE_AND_OWNERSHIP.md
- docs/pr/LEVEL_11_1_CONTRACT_TESTS_AND_ROLLBACK_GATES.md
- docs/pr/LEVEL_11_1_REAL_CONSUMER_VALIDATION_PATH.md
- docs/pr/LEVEL_11_1_IMPLEMENTATION_NOTES_FOR_CODEX.md
- src/advanced/state/constants.js
- src/advanced/state/transitions.js
- src/advanced/state/createWorldGameStateSystem.js
- src/advanced/state/integration/registerWorldGameStateSystem.js
- src/advanced/state/index.js
- tests/world/WorldGameStateAuthoritativeHandoff.test.mjs
- tests/run-tests.mjs
- docs/dev/CODEX_COMMANDS.md
- docs/dev/COMMIT_COMMENT.txt
- docs/dev/NEXT_COMMAND.txt
- docs/dev/README.md

Rules:
- Promote exactly one authoritative transition (`updateObjectiveProgress`)
- Preserve passive-mode comparison behavior
- Validate one real consumer path only
- No engine core API changes
- Repo ZIP output path must use <project folder>/tmp/<ZIP_NAME>.zip
