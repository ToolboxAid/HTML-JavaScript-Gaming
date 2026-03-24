Toolbox Aid
David Quesenberry
03/24/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4
REASONING: medium
COMMAND: Build Paddle Intercept as a game-track entry under games/PaddleIntercept, not under samples; implement a bounded playfield with one ball using constant velocity and wall bounce, and a paddle that moves vertically to intercept the predicted future Y position of the ball using time-to-intercept logic and wall-reflection-aware prediction; use P for pause/resume instead of Escape, include reset behavior, and include a simple intercept marker if it stays readable; keep the presentation minimal, arcade-clean, and game-local; update games/index.html in the correct grouped level; and include tests for prediction correctness, paddle tracking, and stability.
