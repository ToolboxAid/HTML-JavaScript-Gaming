MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_TEMPLATE_ENGINE_THEME_BOOTSTRAP_ALIGNMENT exactly as written.

Rules:
- Source of truth is `games/Asteroids/index.html`
- Modify `games/_template/index.html`
- Add ONLY minimal direct shell/bootstrap/theme dependencies already proven by the canonical game shell
- Keep `_template` non-playable and game-neutral
- Do NOT copy Asteroids gameplay, assets, entities, levels, or flow
- Do NOT modify `games/Asteroids`
- Fail fast on ambiguity or gameplay dependency bleed

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_TEMPLATE_ENGINE_THEME_BOOTSTRAP_ALIGNMENT_delta.zip
