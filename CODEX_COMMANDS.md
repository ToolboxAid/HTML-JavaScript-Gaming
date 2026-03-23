Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: medium
COMMAND: Implement PR-ENGINE-UI-LAYOUT-AND-SHARED-UI-ALIGNMENT. Move /engine/ui/sampleLayout.css to /engine/ui/sampleLayout.css, update all sample and game HTML references to the new path, update any directly related references that still mention the old path, remove the old file, and verify no broken stylesheet links or layout regressions remain. Keep the stylesheet behavior unchanged. Do not change gameplay or engine runtime logic.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that engine/ui/sampleLayout.css exists, all sample/game references were updated, the old engine/ui/sampleLayout.css file was removed, and no gameplay/runtime logic changed.

