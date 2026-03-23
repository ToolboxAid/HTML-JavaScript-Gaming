Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-GRAVITY-WELL-PROMOTION-REUSABLE-VECTOR-FORCE-HELPERS-SINGLE-STEP. Inspect games/GravityWell/ for vector/force helpers and classify each as PROMOTE, KEEP_LOCAL, or SPLIT_REQUIRED. Promote only the clearly reusable generic helpers into the narrowest existing engine location, preferably engine/vector or an already-relevant utility module. Keep all Gravity Well-specific tuning, win/loss logic, thresholds, and gameplay policy local. Update Gravity Well to consume the promoted helper(s), preserve behavior, and add/update focused tests only as needed. Do not redesign the engine, create speculative abstractions, expand gameplay, or perform broad math cleanup.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that only clearly reusable vector/force helpers were promoted, Gravity Well-specific logic stayed local, behavior remained unchanged, and no broad engine/physics abstraction was introduced.
