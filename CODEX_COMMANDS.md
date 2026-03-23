Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-GRAVITY-WELL-VALIDATION-PHASE1 as a docs-only planning pass. Audit games/GravityWell/ for boot correctness, thrust+gravity interaction, win-zone detection, deterministic repeatability, and timing-condition stability. Write docs/prs/PR-GRAVITY-WELL-VALIDATION-PHASE1/PLAN.md and TASKS.md with a small BUILD_PR ladder for hardening and validation. Do not modify runtime source files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that only docs/prs/PR-GRAVITY-WELL-VALIDATION-PHASE1/PLAN.md and TASKS.md were edited and that no runtime source files changed.
