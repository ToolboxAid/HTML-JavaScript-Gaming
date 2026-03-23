Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ENGINE-CLASS-USAGE-ALIGNMENT-AND-GUARDRAIL. Mechanically align shipped samples and games to canonical public engine barrels where the audit already proved replacements exist: normalize scene imports to engine/scenes/index.js across samples and Asteroids, normalize Asteroids deep imports for fx/collision/utils/tooling to their public barrels, and add a focused validation guardrail that catches new deep imports into engine subsystems that already expose index.js. Keep engine/core/Engine.js as the approved direct-import exception. Do not change runtime behavior, gameplay, or engine APIs.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that public barrel alignment is complete for the audited drift, the import guardrail exists and allows engine/core/Engine.js, and no runtime/gameplay behavior changed.
