MODEL: GPT-5.4
REASONING: medium
COMMAND: Create BUILD_PR_LEVEL_10_4_SYSTEM_EVENT_PIPELINE as a docs-first, repo-structured delta. Use docs/pr/PLAN_PR_LEVEL_10_4_SYSTEM_EVENT_PIPELINE.md as the source of truth. Define a centralized system event pipeline that composes with existing systems through public APIs only. Focus on event naming, payload contracts, producer/consumer boundaries, subscription ownership, and optional composition for advanced systems. Do not modify engine core APIs in this PLAN step. Include docs/dev control files and a repo-structured ZIP.

FINAL STEP:
- Package all created and modified files into a repo-structured delta ZIP
- Write the result ZIP to: /tmp/BUILD_PR_LEVEL_10_4_SYSTEM_EVENT_PIPELINE_delta.zip
- Preserve exact repo-relative structure inside the ZIP
- Include only files relevant to this PR
- Do not include unrelated files, full-repo copies, dependencies, or build artifacts
