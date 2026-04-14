MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_25_POLISH_AND_EDGE_CASES`

1. Validate and polish the shared bezel/background system for edge cases:
   - bezel missing
   - bezel malformed
   - no valid transparency window
   - fullscreen enter/exit cycles
   - fullscreen resize
   - malformed or extreme override values
   - background missing
   - gameplay/non-gameplay transitions
   - starfield ordering regressions

2. Keep fixes surgical and minimal

3. Confirm shared code remains game-agnostic and works for:
   - Asteroids
   - games/_template
   - additional sample coverage already established

4. Final packaging step is REQUIRED:
   <project folder>/tmp/BUILD_PR_LEVEL_10_25_POLISH_AND_EDGE_CASES.zip

Rules:
- no unrelated repo changes
- no redesign
- minimal corrections only
