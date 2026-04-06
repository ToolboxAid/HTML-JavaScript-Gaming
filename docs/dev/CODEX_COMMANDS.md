MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PR_DEBUG_SURFACES_NETWORK_SERVER_OPS_FULL

PURPOSE:
Extend the network support plan with:
- Track T — Server Dashboard
- Track U — Server Containerization

IN SCOPE:
- PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_OPS
- BUILD_PR_DEBUG_SURFACES_NETWORK_SERVER_OPS
- APPLY_PR_DEBUG_SURFACES_NETWORK_SERVER_OPS
- docs/dev/NETWORK_SAMPLES_PLAN.md updates for Track T and Track U

RULES:
- docs-first
- one PR per purpose
- preserve checklist style [ ] [.] [x]
- no engine-core changes
- no unrelated roadmap edits

OUTPUT:
<project folder>/tmp/PR_DEBUG_SURFACES_NETWORK_SERVER_OPS_FULL_bundle.zip