MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_SURFACES_PROMOTION

Requirements:
- Follow PLAN_PR -> BUILD_PR -> APPLY_PR
- Docs-first only
- One PR per purpose
- Extraction/relocation only; no feature expansion
- Build authoritative target structure for engine-core vs engine-debug vs project-owned integrations
- Include ownership matrix, ordered migration steps, validation goals, rollback strategy, and rollout notes
- Keep sample-specific panels/providers/commands outside shared layers
- Preserve `MultiSystemDemoScene.js` as the proving integration
- Write outputs under docs/pr and docs/dev/reports
- Put codex command and commit comment under docs/dev
- Package to <project folder>/tmp/BUILD_PR_DEBUG_SURFACES_PROMOTION_delta.zip
