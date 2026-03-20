BUILD_PR
model: GPT-5.4
reasoning: high
chatGPT runs: YES
user runs: NO

APPLY_PR
model: GPT-5.4-mini
reasoning: medium
chatGPT runs: YES
user runs: YES
codex run build_pr
--scope tests/engine/game
--focus add_gameTurnFlowUtils_direct_equivalence_probe

