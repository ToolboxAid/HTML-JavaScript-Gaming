MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Apply APPLY_PR_DEBUG_SURFACES_PRESETS and APPLY_PR_DEBUG_SURFACES_ADVANCED_UX

Requirements:
- Execute both APPLY PRs in sequence
- Do not introduce new features
- Preserve behavior parity
- Use existing public APIs only
- Validate after both APPLY steps
- Do not refactor unrelated systems
- Keep project-specific logic outside engine-debug
- Ensure preset system and advanced UX integrate cleanly
- Maintain persistence compatibility
