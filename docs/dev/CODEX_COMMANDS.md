MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_SPACE_INVADERS_CLEAR_DESTINATION exactly as written.

Rules:
- Delete ONLY `games/SpaceInvaders/**`
- Leave `games/SpaceInvaders/` present and empty
- Do NOT touch `games/SpaceInvaders_next/**`
- Do NOT recreate missing files such as `capture-preview.html` in this PR
- Fail fast on ambiguity

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_CLEAR_DESTINATION_delta.zip
