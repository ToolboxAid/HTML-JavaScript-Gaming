MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Follow PLAN_PR + BUILD_PR + APPLY_PR

- Docs-first unless BUILD/APPLY
- No engine core changes
- One PR per purpose
- Keep integration sample-level
- Smallest-scoped valid implementation only
- Read target files first
- Avoid repo-wide scanning unless exact targets require it
- No speculative exploration
- Stop on ambiguity
- Package to <project folder>/tmp/*.zip
