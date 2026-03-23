Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: low
COMMAND: Implement PR-DOCS-CORRECT-SHARED-FOLDER-NOTES. Update the relevant documentation so it correctly states that sampleLayout.css moved from /samples/_shared/ to /engine/ui/, while samples/_shared/ still remains intentionally because it contains sample-owned helper files such as lateSampleBootstrap.js and platformerHelpers.js. Do not change runtime or gameplay code.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify the docs no longer imply samples/_shared/ is empty or removable and that no code files changed.
