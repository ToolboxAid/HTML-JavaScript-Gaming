MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION

Requirements:
- Follow PLAN_PR + BUILD_PR + APPLY_PR
- Docs-first
- One PR per purpose
- No engine core changes
- Keep scope to server containerization only
- Produce repo-structured delta zip to <project folder>/tmp/
- Update docs/roadmaps/* with bracket-only edits only
- Keep dashboard/network debug architecture intact
