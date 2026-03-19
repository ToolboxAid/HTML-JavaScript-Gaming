model: GPT-5.4
reasoning: high
codex command: Review `engine/game` exports and produce a surgical docs-first boundary implementation plan aligned to GameBase-centered architecture. Classify each export as public, internal, or transitional. Do not change runtime behavior.

model: GPT-5.4-mini
reasoning: medium
codex command: Inventory current `engine/game` files and imports. Suggest boundary labels and minimal docs changes only.

model: GPT-5.3-codex
reasoning: high
codex command: Prepare BUILD_PR patch set for `engine/game` boundary docs and markers only. No behavior changes. Keep compatibility intact.
