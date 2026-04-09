MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_TEMPLATE_ENGINE_THEME_CANVAS_STATUS_TEXT exactly as written.

Rules:
- Keep the canonical shell/theme baseline alignment
- Modify `games/_template/index.html`
- Render the required status text on the canvas, not as HTML status text
- Keep `_template` non-playable and game-neutral
- Do NOT copy Asteroids gameplay, assets, entities, levels, or flow
- Do NOT modify `games/Asteroids`
- Fail fast on ambiguity or gameplay dependency bleed

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_ENGINE_THEME_CANVAS_STATUS_TEXT_delta.zip
