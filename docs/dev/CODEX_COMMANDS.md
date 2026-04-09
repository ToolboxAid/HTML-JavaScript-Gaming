MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_BREAKOUT_FULL_FOLDER_MIGRATION exactly as written.

Rules:
- Work only on the Breakout migration lane
- Use `games/_template/**` as the template source
- Read gameplay from `games/Breakout/**`
- Stage into `games/Breakout_next/**`
- Validate `_next`
- Clear canonical `games/Breakout/**`
- Copy `_next` back into canonical
- Validate canonical
- Remove `_next`
- Put files into correct destination folders by responsibility
- Fail fast instead of guessing any unclear destination
- Do NOT refactor engine/shared broadly
- Do NOT change unrelated games
- Do NOT invent missing files

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_BREAKOUT_FULL_FOLDER_MIGRATION_delta.zip
