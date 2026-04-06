MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Apply BUILD_PR_DEBUG_SURFACES_INSPECTORS exactly as defined.

- Use docs/pr/BUILD_PR_DEBUG_SURFACES_INSPECTORS.md as implementation contract
- Do not expand scope
- Preserve engine/runtime separation
- Do not modify unrelated files

VALIDATION:
- Inspector surfaces are read-only
- Entity inspector works
- Component inspector works
- State diff viewer works
- Timeline debugger works
- Event stream viewer works
- No runtime regressions
- Frame buffer remains bounded

ROADMAP UPDATE:
Update docs/dev/BIG_PICTURE_ROADMAP.md using bracket-only edits:
- Entity inspector -> [x]
- Component inspector -> [x]
- State diff viewer -> [x]
- Timeline debugger -> [x]
- Event stream viewer -> [x]

OUTPUT:
Create APPLY_PR_DEBUG_SURFACES_INSPECTORS delta ZIP at:
<project folder>/tmp/APPLY_PR_DEBUG_SURFACES_INSPECTORS_delta.zip