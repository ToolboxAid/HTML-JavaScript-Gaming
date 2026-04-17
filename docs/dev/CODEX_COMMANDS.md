MODEL: GPT-5.3-codex
REASONING: high

Execute BUILD_PR_LEVEL_18_10_REMOVE_SAMPLE_SPECIFIC_LOGIC_FROM_ENGINE_PATHS.

Required behavior:
1. Inspect engine paths for any remaining sample-specific logic.
2. Remove or relocate that logic out of engine paths.
3. Preserve stable engine contracts.
4. Apply only the exact consumer/import changes required by the removal/relocation.
5. Re-run validation and document findings in docs/dev/reports.

Roadmap rules:
- update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md in place only when execution-backed
- never delete roadmap content
- never rewrite roadmap text
- only update status markers:
  - [ ] -> [.]
  - [.] -> [x]

Constraints:
- no unrelated cleanup
- no broad refactors
- keep scope limited to closing the final open item in Track A

Packaging:
- produce final ZIP at:
  <project folder>/tmp/BUILD_PR_LEVEL_18_10_REMOVE_SAMPLE_SPECIFIC_LOGIC_FROM_ENGINE_PATHS.zip
