MODEL: GPT-5.3-codex
REASONING: high
COMMAND: Create BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT as an implementation delta driven by docs only. Use the Level 10.6 BUILD docs and the Level 10.7 docs/pr package as source of truth. Implement a minimal contract-only world/game state runtime pilot with an explicit initial state factory, read-only selectors, named transition stubs, Level 10.4-aligned event helpers, a Level 10.5-style integration registration wrapper, and one optional consumer that mirrors objective state through approved events and public selectors only. Preserve behavior with passiveMode enabled by default. Do not modify engine core APIs.

FINAL STEP:
- Package all created and modified files into a repo-structured delta ZIP
- Write the result ZIP to: <project>/tmp/BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT_delta.zip
- Preserve exact repo-relative structure inside the ZIP
- Include only files relevant to this PR
- Do not include unrelated files, full-repo copies, dependencies, or build artifacts
