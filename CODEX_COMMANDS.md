Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: medium
COMMAND: Implement PR-ENGINE-UI-SAMPLE-LAYOUT-CSS. Move /samples/_shared/sampleLayout.css to /engine/ui/sampleLayout.css, keep the file name as sampleLayout.css, update all sample and game HTML references to the new path, remove the old file, and verify no layout regressions or broken links remain. Do not redesign the stylesheet or change engine/game runtime behavior.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that engine/ui/sampleLayout.css exists, all references were updated, the old samples/_shared/sampleLayout.css file was removed, and no runtime/gameplay files changed.
