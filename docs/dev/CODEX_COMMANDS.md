MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_SPACE_INVADERS_COPY_FROM_NEXT exactly as written.

Rules:
- Copy from `games/SpaceInvaders_next/**`
- Write to `games/SpaceInvaders/**`
- Preserve structure exactly
- Do NOT modify `_next`
- Do NOT invent missing files
- Validate capture-preview.html rule strictly
- Fail fast on ambiguity

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_SPACE_INVADERS_COPY_FROM_NEXT_delta.zip
