MODEL: GPT-5.4
REASONING: medium

COMMAND:
Create `BUILD_PR_ROADMAP_ADD_FULL_NETWORK_CAPABILITY_BEFORE_3D`.

Roadmap-only update.

Required work:
1. Update `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`.
2. Add a new roadmap lane for full real-network capability prior to 3D execution.
3. Include explicit items for:
   - real transport/session layer
   - authoritative live server runtime
   - replication/client application
   - playable real multiplayer validation
   - server hosting + Docker containerization
   - promotion/readiness gate
   - include samples for phase 13  
4. Update sequencing/dependency wording so real-network capability is completed before active 3D execution begins.
5. Preserve all already-complete network/debug/container items.
6. Do NOT delete existing roadmap content.
7. Do NOT rewrite unrelated roadmap text.
8. Package the updated roadmap bundle into:
   `<project folder>/tmp/BUILD_PR_ROADMAP_ADD_FULL_NETWORK_CAPABILITY_BEFORE_3D.zip`

Hard rules:
- roadmap update only
- additive preferred
- no code changes
- no unrelated edits
