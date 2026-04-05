MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_DEBUG_SURFACES_PROMOTION

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR per purpose
- Minimize engine-core changes
- Promote proven debug systems out of tools/dev
- Define target ownership across engine-core, engine-debug, and project/sample/tool layers
- Include target folder structure, migration phases, validation strategy, risk controls, and rollout notes
- Keep sample-specific panels/providers/commands outside shared layers
- Write outputs under docs/pr and docs/dev/reports
- Put codex command and commit comment under docs/dev
- Package to <project folder>/tmp/PLAN_PR_DEBUG_SURFACES_PROMOTION_delta.zip
