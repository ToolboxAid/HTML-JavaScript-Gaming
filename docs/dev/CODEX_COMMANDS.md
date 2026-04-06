MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_DEBUG_SURFACES_NETWORK_PROMOTION

Requirements:
- Follow PLAN_PR + BUILD_PR + APPLY_PR
- Docs-first
- One PR per purpose
- No engine core changes in this PLAN PR
- Define promotion path for proven network debug capabilities
- Prefer reusable ownership under engine/debug/network
- Keep engine core limited to minimal contracts/hooks only
- Keep sample-specific scenarios, feeds, and local adapters project-owned
- Include target structure, ownership matrix, migration phases, validation strategy, risk controls, and rollout notes
- Update roadmap references under docs/roadmaps/ with bracket-only edits only if needed
- Write outputs under docs/pr and docs/dev/reports
- Package to <project folder>/tmp/PLAN_PR_DEBUG_SURFACES_NETWORK_PROMOTION_delta.zip
