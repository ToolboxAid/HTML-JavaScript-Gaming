MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute BUILD_PR_GAMES_PACMANLITE_NEXT_TEMPLATE_BASELINE exactly as written.

Rules:
- use `games/_template/**` as source of truth
- create `games/PacmanLite_next/**`
- keep `games/PacmanLite/**` unchanged
- keep `_next` baseline non-playable
- required status text must render on canvas
- fail fast on ambiguity

Package output to:
<project folder>/tmp/BUILD_PR_GAMES_PACMANLITE_NEXT_TEMPLATE_BASELINE_delta.zip
