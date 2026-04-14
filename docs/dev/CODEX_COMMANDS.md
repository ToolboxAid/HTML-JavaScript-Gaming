MODEL: GPT-5.4
REASONING: high
COMMAND: Create BUILD_PR_LEVEL_09_05_SHARED_ASSET_HANDOFF_ENFORCEMENT as a docs-first, repo-structured delta. Use docs/pr/BUILD_PR_LEVEL_09_05_SHARED_ASSET_HANDOFF_ENFORCEMENT.md as the source of truth. Implement the smallest safe enforcement slice that makes first-class tools launch and consume shared asset/palette handoffs through the normalized contract established by 09_04. Keep scope limited to first-class tools, shared launch/handoff helpers, and focused tests only. Do not modify engine core APIs, game runtime behavior, legacy tool surfacing, or perform broad UI cleanup.

FINAL STEP:
- Package all created and modified files into a repo-structured ZIP
- Write the result ZIP to: <project folder>/tmp/BUILD_PR_LEVEL_09_05_SHARED_ASSET_HANDOFF_ENFORCEMENT.zip
- Preserve exact repo-relative structure inside the ZIP
- Include only files relevant to this PR
- Do not include unrelated files, full-repo copies, dependencies, or build artifacts

