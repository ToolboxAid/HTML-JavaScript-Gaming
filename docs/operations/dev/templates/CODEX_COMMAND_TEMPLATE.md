MODEL: GPT-5.3-codex
REASONING: high

TASK:
<BUILD_PR_NAME>

INPUTS:
- docs/pr/<PLAN_PR_NAME>.md
- docs/pr/<BUILD_PR_NAME>.md

EXECUTION:
- Follow the referenced PR doc(s) as source of truth
- Read exact target files first
- Keep scope surgical
- Stop and report on ambiguity
- Do not change engine core unless the task explicitly requires it

FINAL STEP:
- Package all created and modified files into a repo-structured delta ZIP
- Write the ZIP to: <project folder>/tmp/<BUILD_PR_NAME>_delta.zip
- Preserve exact repo-relative structure inside the ZIP
- Include only files relevant to this PR
- Do not include unrelated files, full-repo copies, dependencies, or build artifacts
