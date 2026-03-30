MODEL: GPT-5.3-codex
REASONING: high
COMMAND: Create BUILD_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE as a docs-first, repo-structured delta. Use Level 10.7 docs and runtime stubs as source of truth. Promote exactly one named transition for objective progress from passive mirror handling to narrowly authoritative ownership behind a feature gate. Add contract tests, preserve passive-mode comparison behavior, validate one real consumer path through approved events and public selectors only, and do not change engine core APIs.

FINAL STEP:
- Package all created and modified files into a repo-structured delta ZIP
- Write the result ZIP to: <project folder>/tmp/BUILD_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE_delta.zip
- Preserve exact repo-relative structure inside the ZIP
- Include only files relevant to this PR
- Do not include unrelated files, full-repo copies, dependencies, or build artifacts
