Toolbox Aid
David Quesenberry
03/25/2026
CODEX_START_OF_DAY.md

PROJECT: HTML-JavaScript-Gaming Repo

CURRENT STATE:
- Samples 001–182 complete and working
- samples/index.html is up to date
- Level 4: Classic Arcade Space Invaders complete
- Space Invaders final polish pass complete

ARCHITECTURE RULES:
- PLAN_PR → BUILD_PR → APPLY_PR
- No breaking changes
- Reuse engine systems
- Follow ENGINE RULES (LOCKED)

CURRENT TASK:
- Plan Space Duel (arcade-accurate target)

REQUIREMENTS:
- As close to original arcade as possible
- Use engine-facing patterns consistent with other games
- Generate placeholder WAV files for sounds during build
- Keep reusable logic in engine only if reused beyond this game

OUTPUT:
- Delta ZIP
- Match repo structure exactly
- Include /docs/dev updates if changed

DEFINITION OF DONE:
- PLAN_PR approved
- Clear game scope defined
- Engine classes used documented
- Sound placeholder strategy documented
