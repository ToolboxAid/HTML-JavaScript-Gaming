MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION

Requirements:
- Follow PLAN_PR + BUILD_PR + APPLY_PR
- This is code/runtime work, not documentation-only work
- Use the BUILD doc as the exact blueprint
- One PR per purpose
- No engine core changes
- Keep scope to Sample A server containerization only
- Create/update:
  - games/network_sample_a/server/Dockerfile
  - games/network_sample_a/.dockerignore
  - games/network_sample_a/server/docker-compose.yml
  - games/network_sample_a/server/README.md
  - games/network_sample_a/server/networkSampleADashboardServer.mjs only if required for env-safe host/access compatibility
- Update docs/roadmaps/NETWORK_SAMPLES_PLAN.md with bracket-only edits only
- Do not overwrite BIG_PICTURE_ROADMAP.md
- Do not overwrite PRODUCTIZATION_ROADMAP.md
- Package repo-structured delta zip to <project folder>/tmp/BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION_delta.zip
