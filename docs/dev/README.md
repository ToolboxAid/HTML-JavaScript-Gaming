Level 10.7 BUILD_PR implementation package.

Contents:
- docs/pr/BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT.md
- docs/pr/LEVEL_10_7_IMPLEMENTATION_SCOPE_AND_GATES.md
- docs/pr/LEVEL_10_7_MODULE_PUBLIC_API.md
- docs/pr/LEVEL_10_7_OPTIONAL_CONSUMER_PILOT.md
- docs/pr/LEVEL_10_7_VALIDATION_AND_ROLLOUT.md
- src/advanced/state/constants.js
- src/advanced/state/utils.js
- src/advanced/state/initialState.js
- src/advanced/state/selectors.js
- src/advanced/state/transitions.js
- src/advanced/state/events.js
- src/advanced/state/createWorldGameStateSystem.js
- src/advanced/state/consumers/createObjectiveProgressMirrorConsumer.js
- src/advanced/state/integration/registerWorldGameStateSystem.js
- src/advanced/state/index.js
- docs/dev/CODEX_COMMANDS.md
- docs/dev/COMMIT_COMMENT.txt
- docs/dev/NEXT_COMMAND.txt
- docs/dev/README.md

Notes:
- Runtime implementation is contract-only, passive-mode-first, and isolated under src/advanced/state.
- No engine core APIs were modified.

Codex output requirement:
- Return a repo-structured delta ZIP at:
  <project>/tmp/BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT_delta.zip
