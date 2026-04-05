Toolbox Aid
David Quesenberry
04/05/2026
codex_commands.md

# CODEX COMMANDS

## APPLY_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY

MODEL: GPT-5.4
REASONING: high

COMMAND:
Apply APPLY_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY as a focused implementation PR.

Requirements:
- Implement only the approved dev console and debug overlay contracts
- Keep diagnostics orchestration above engine core
- Consume approved runtime scene loader and render pipeline contracts
- Preserve deterministic render order with debug overlay last and console surface after overlay
- Add structured validation and failure isolation for adapters, commands, and panels
- Preserve hot reload survival behavior and last-known-good runtime safety
- Add focused tests for contracts, ordering, failure isolation, and reload stability
- Keep changes surgical and architecture-aligned
- Update docs/dev reports after validation

Package:
- Produce repo-structured implementation delta ZIP at:
  <project folder>/tmp/APPLY_PR_DEV_CONSOLE_AND_DEBUG_OVERLAY_delta.zip
