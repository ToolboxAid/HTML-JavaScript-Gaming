# Codex Commands

MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_STARTER_PROJECT_TEMPLATE` as a docs-first implementation PR.

Requirements:
- Add one starter project template only
- Keep `Sprite Editor` first-class
- Keep `SpriteEditor_old_keep` hidden legacy
- Keep `tools/index.html` tool-only and sample-free
- Use shared assets and palettes by reference
- Do not add gameplay systems
- Do not add samples back to the main tools surface

Implement:
1. Starter project template folder and manifest
2. Shared asset references for acvector/tile/parallax/sprite validation
3. Shared palette references
4. Project open/save/reload compatibility
5. Minimal README or inline project notes if helpful
6. Validation pass for cross-tool loading

Package output to:
`<project folder>/tmp/BUILD_PR_STARTER_PROJECT_TEMPLATE.zip`
