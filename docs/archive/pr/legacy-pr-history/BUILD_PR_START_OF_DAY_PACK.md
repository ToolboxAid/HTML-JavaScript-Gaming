Toolbox Aid
David Quesenberry
04/05/2026
BUILD_PR_START_OF_DAY_PACK.md

# BUILD PR
Start Of Day Pack

## Objective
Create a standardized dev/docs/start_of_day folder containing only the essential files needed to resume work in ChatGPT and Codex sessions.

## Scope
- Create docs/dev/start_of_day/
- Place curated minimal files for session bootstrap
- Remove duplication and noise
- Keep files lightweight and copy/paste friendly

## Required Files

docs/dev/start_of_day/
- SESSION_CONTEXT.md
- CODEX_SESSION_PROMPT.md
- CURRENT_STATE.md
- NEXT_STEPS.md

## File Definitions

### SESSION_CONTEXT.md
- Project overview
- Architecture summary
- Key constraints (docs-first, no engine pollution, etc.)

### CODEX_SESSION_PROMPT.md
- Copy/paste ready Codex command template
- Includes model + reasoning + command format

### CURRENT_STATE.md
- What has been completed
- Current active systems (console, HUD, runtime, etc.)

### NEXT_STEPS.md
- Current next PR
- Short task list

## Constraints
- No runtime/code changes
- Docs only
- No duplication of large PR history
- Keep under 200 lines per file

## Acceptance Criteria
- Folder exists and is clean
- Files are minimal and useful
- Can restart ChatGPT session with SESSION_CONTEXT.md
- Can restart Codex session with CODEX_SESSION_PROMPT.md

## Output
<project folder>/tmp/BUILD_PR_START_OF_DAY_PACK_delta.zip
