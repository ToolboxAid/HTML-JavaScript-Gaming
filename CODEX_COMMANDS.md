Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Create PR-ENGINE-STABILIZATION-AND-PROMOTION-PHASE as a docs-only planning pass. Audit engine/, later samples, and games/asteroids/ to identify post-cleanup stabilization targets, repeated logic suitable for promotion, and Asteroids validation targets. Classify promotion candidates as PROMOTE_TO_ENGINE, KEEP_LOCAL, SPLIT_REQUIRED, or NEEDS_MORE_PROOF, then write docs/prs/PR-ENGINE-STABILIZATION-AND-PROMOTION-PHASE/PLAN.md and TASKS.md with a small-PR execution ladder. Do not modify runtime source files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that only docs/prs/PR-ENGINE-STABILIZATION-AND-PROMOTION-PHASE/PLAN.md and TASKS.md were edited and that no runtime source files changed.
