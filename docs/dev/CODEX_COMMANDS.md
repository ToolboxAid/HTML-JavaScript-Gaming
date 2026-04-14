MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_11_2_COMBINED_RUNTIME_DIRECTION_AND_RULE_MOVE_GUARDS` as one combined Level 11 setup PR.

Goals:
1. Define and prepare the next core runtime direction in one compact PR.
2. Add an explicit migration guard for any future roadmap/instruction cleanup.

Required rules:
- if roadmap content is being moved to PROJECT_INSTRUCTIONS.md, MOVE it; do not simply delete it
- destination text must exist before source text is removed
- preserve wording unless the PR explicitly requires rewriting
- roadmap handling remains status-only unless explicitly requested otherwise
- do not delete roadmap content during cleanup work

Outputs:
- compact PR doc
- any required docs updates for Level 11 direction
- validation notes
- repo-structured ZIP

Final packaging step is REQUIRED:
`<project folder>/tmp/BUILD_PR_LEVEL_11_2_COMBINED_RUNTIME_DIRECTION_AND_RULE_MOVE_GUARDS.zip`

Hard rules:
- combine work to reduce PR count
- no unrelated repo changes
- no missing ZIP
