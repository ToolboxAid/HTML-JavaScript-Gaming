Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# PLAN — Gravity Well Final Validation and Hardening

Validate:
1. Replay determinism (same input → same result)
2. dt sensitivity (large step vs many small steps)
3. long-run stability (no drift explosion)

Only apply fixes if tests fail.
All fixes must stay local to games/GravityWell/.
