Level 11.4 implementation bundle.

Contents:
- docs/pr/BUILD_PR_LEVEL_11_4_AUTHORITATIVE_STATE_SCORE_IMPLEMENTATION.md
- docs/pr/LEVEL_11_4_RULES.md
- docs/pr/LEVEL_11_4_TESTS.md
- docs/pr/LEVEL_11_4_REPORTS.md
- src/advanced/state/constants.js
- src/advanced/state/transitions.js
- src/advanced/state/createWorldGameStateSystem.js
- tests/world/WorldGameStateAuthoritativeScore.test.mjs
- tests/run-tests.mjs
- docs/dev/CODEX_COMMANDS.md
- docs/dev/COMMIT_COMMENT.txt
- docs/dev/NEXT_COMMAND.txt
- docs/dev/README.md
- docs/dev/reports/file_tree.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt

Rules:
- `authoritativeScore` feature gate defaults OFF
- Exactly one authoritative score transition (`applyScoreDelta`)
- Transition-only writes for authoritative score slice
- Selector reads remain read-only
- One consumer path only
- No engine modifications
