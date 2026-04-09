MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_SPACE_INVADERS_GAMEPLAY_MIGRATION_TO_NEXT exactly as written.

Rules:
- Read from `games/SpaceInvaders/**`
- Write only to `games/SpaceInvaders_next/**`
- Put files into the correct destination folders by responsibility
- Fail fast instead of guessing any unclear destination
- Keep `games/SpaceInvaders/**` unchanged
- Do NOT perform canonical replacement
- Do NOT refactor engine/shared broadly
- Do NOT change unrelated games

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_GAMEPLAY_MIGRATION_TO_NEXT_delta.zip
