Toolbox Aid
David Quesenberry
03/25/2026
CODEX_START_OF_DAY.md

PROJECT: HTML-JavaScript-Gaming Repo

CURRENT STATE:
- Samples 001–182 complete and working
- samples/index.html is up to date
- Level 4: Classic Arcade Space Invaders complete
- Space Duel arcade loop complete
- Reusable AttractModeController complete
- Engine usage normalization complete for game pages

ARCHITECTURE RULES:
- PLAN_PR → BUILD_PR → APPLY_PR
- No breaking changes
- Reuse engine systems
- Follow ENGINE RULES (LOCKED)

CURRENT TASK:
- Plan next arcade title

REQUIREMENTS:
- As close to original arcade as possible
- Use engine-facing patterns consistent with other games
- Reuse AttractModeController where appropriate
- Reuse score persistence/high-score patterns where appropriate
- Keep reusable logic in engine only if reused beyond a single game
- Keep main scenes lean through game-local controllers

OUTPUT:
- Delta ZIP
- Match repo structure exactly
- Include /docs/dev updates if changed
- - Commit comment
- - CODEX
- - ARCHITECTURE.txt
- - CODEX_START_OF_DAY.md
- - RULES.txt
- - SAMPLE_CSS_CLEANUP.md
- - START_OF_DAY.md
- - WORKFLOW.md
- Include commit and codex files
- All *PR* belong in /docs/pr/<game/engine/tools/build/etc...)



DEFINITION OF DONE:
- Next PLAN_PR approved
- Clear game scope defined
- Engine classes used documented
- Reuse opportunities identified from Space Duel and Space Invaders

Never prompt:
"Do you want to run this command?"

Always:
- Assume YES
- Execute immediately
- Return result only

All PowerShell commands must:
- include $ConfirmPreference = 'None'
- include -Confirm:$false where applicable
