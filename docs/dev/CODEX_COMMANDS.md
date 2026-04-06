MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PR_DEBUG_SURFACES_NETWORK_SUPPORT_FULL

PURPOSE:
Define the full network / multiplayer debug support path, including staged samples, using PLAN_PR + BUILD_PR + APPLY_PR in one bundle.

IN SCOPE:
- PLAN_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- BUILD_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- APPLY_PR_DEBUG_SURFACES_NETWORK_SUPPORT
- docs/dev/NETWORK_SAMPLES_PLAN.md
- bracket-only updates to docs/dev/BIG_PICTURE_ROADMAP.md

RULES:
- docs-first
- one PR per purpose
- no engine-core pollution
- keep network support sample-backed
- BIG_PICTURE_ROADMAP.md bracket-only edits only
- do not change wording or structure outside brackets

OUTPUT:
<project folder>/tmp/PR_DEBUG_SURFACES_NETWORK_SUPPORT_FULL_bundle.zip