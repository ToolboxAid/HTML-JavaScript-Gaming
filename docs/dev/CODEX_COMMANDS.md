# MODEL
GPT-5.4

# REASONING
high

# COMMAND
Create BUILD_PR_LEVEL_09_18_CODEX_PLAN_SWITCH_AND_API_KEY_SCRIPTING as a docs-first, surgical PR for `HTML-JavaScript-Gaming`.

## Mission
Add a small PowerShell-based repo automation slice that:
- switches between Pay-as-you-go and Codex plan modes
- inputs/updates API key configuration
- validates the configured API key state safely

## Required scope
- add PowerShell scripts for plan switching
- add PowerShell scripts for API key input/update
- add PowerShell scripts for API key validation
- keep the scripts local-repo/operator focused
- document usage and guardrails
- add focused validation or smoke checks where practical

## Preferred implementation style
- PowerShell first
- obvious operator-facing script names
- outputs/helper artifacts routed to the project folder when applicable
- keep scripts lightweight, deterministic, and easy to inspect

## Hard rules
- do not change engine code
- do not add gameplay/runtime features
- do not redesign tools
- do not expand into broad deployment automation in this PR
- do not implement the website prep/update/delete scripts in this PR
- do not implement the game-template asset conversion scripts in this PR
- keep this PR surgical and purpose-specific

## Roadmap instruction
Update roadmap status where this PR clearly advances tracked work.

Also add these new roadmap items as explicitly requested:
1. Existing games asset folders should be updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates.
2. Add the ability for a PowerShell script to create a new game from template, including a project scaffold for the tools.
3. Add scripts to prep / update / delete the repo so it can be placed on a website.
4. Add scripts to switch between Pay-as-you-go and Codex plan modes, and scripts to input API key material and validate it.

These roadmap additions are allowed text additions for this PR.

## Deliverables
Return a single repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_18_CODEX_PLAN_SWITCH_AND_API_KEY_SCRIPTING.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_18_CODEX_PLAN_SWITCH_AND_API_KEY_SCRIPTING.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/next_command.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt

## Validation
Run focused checks only:
- PowerShell parse/readiness checks on touched scripts
- focused smoke checks for plan switching logic
- focused smoke checks for API key input/update path
- focused smoke checks for API key validation path

## Success definition
- repo has clear scripts for plan switching
- repo has clear scripts for API key input/update
- repo has clear scripts for API key validation
- roadmap includes the requested new items
- final output is one ZIP in `<project folder>/tmp/`
