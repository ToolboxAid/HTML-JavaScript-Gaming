MODEL: GPT-5.3-codex
REASONING: high
COMMAND: Create BUILD_PR_LEVEL_10_6_WORLD_STATE_GAME_STATE_SYSTEM as a docs-first, repo-structured delta. Use docs/pr/PLAN_PR_LEVEL_10_6_WORLD_STATE_GAME_STATE_SYSTEM.md as the source of truth. Define a formal world state / game state system that composes with existing advanced systems through public APIs and approved event contracts only. Focus on shared state shape, selector patterns, named transitions, ownership boundaries, and safe composition with the Level 10.4 event pipeline and Level 10.5 integration layer. Do not modify engine core APIs in this PLAN step. Include docs/dev control files and a repo-structured ZIP.

FINAL STEP:
- Package all created and modified files into a repo-structured delta ZIP
- Write the result ZIP to: /tmp/BUILD_PR_LEVEL_10_6_WORLD_STATE_GAME_STATE_SYSTEM_delta.zip
- Preserve exact repo-relative structure inside the ZIP
- Include only files relevant to this PR
- Do not include unrelated files, full-repo copies, dependencies, or build artifacts
