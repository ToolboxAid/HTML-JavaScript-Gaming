MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_SPACE_INVADERS_REMOVE_NEXT exactly as written.

Rules:
- Delete ONLY `games/SpaceInvaders_next/**`
- Remove `games/SpaceInvaders_next/` after contents are deleted
- Do NOT touch `games/SpaceInvaders/**`
- Do NOT add or restore preview files
- Do NOT modify engine/shared code
- Fail fast on ambiguity

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_REMOVE_NEXT_delta.zip
