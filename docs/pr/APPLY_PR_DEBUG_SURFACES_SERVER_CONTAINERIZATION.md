Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md

# APPLY_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION

## Apply Intent
Apply the minimal Sample A server containerization defined by the BUILD doc.
This APPLY step is code/runtime work for Codex, not documentation work for ChatGPT.

## In Scope Files
- `games/network_sample_a/server/Dockerfile`
- `games/network_sample_a/.dockerignore`
- `games/network_sample_a/server/docker-compose.yml`
- `games/network_sample_a/server/README.md`
- `games/network_sample_a/server/networkSampleADashboardServer.mjs` only if required for env-safe host/access compatibility
- `docs/pr/BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/next_command.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/file_tree.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/roadmaps/NETWORK_SAMPLES_PLAN.md` with bracket-only edits only

## Hard Rules
- no engine-core changes
- no dashboard mutation features
- no auth redesign
- no orchestration stack
- no unrelated runtime refactors
- no placeholder docs
- no roadmap structure changes

## Acceptance
- Dockerfile builds Sample A dashboard server image
- compose file runs the same service contract
- env vars are documented and honored
- health route works
- README is actionable
- roadmap Track U items update by bracket-only edits
