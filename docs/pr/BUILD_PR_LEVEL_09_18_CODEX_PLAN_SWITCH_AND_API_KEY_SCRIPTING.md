# BUILD_PR — LEVEL 09_18 — CODEX PLAN SWITCH AND API KEY SCRIPTING

## Objective
Create the next surgical scripting PR for repo operations by introducing scripts that switch between Pay-as-you-go and Codex plan modes, plus scripts that accept an API key, store it appropriately for local repo workflows, and validate it safely.

This PR also updates the roadmap to add the newly requested future scripting and asset-conversion lanes.

## Why This PR Exists
The current asset/tooling lane is far enough along to justify a small repo-automation scripting lane.

The immediate need is operational:
- switch between Pay-as-you-go and Codex plan modes
- provide a repeatable API key input path
- validate the configured API key before use

These scripts should reduce operator friction and make repo setup safer and more repeatable.

## In Scope
- add PowerShell scripts for switching between Pay-as-you-go and Codex plan modes
- add PowerShell script(s) to input/configure API key material for local workflow use
- add PowerShell script(s) to validate the configured API key safely
- document expected local usage, inputs, outputs, and guardrails
- keep scripts local-repo/operator focused
- add focused validation or smoke checks for script behavior where practical

## Out of Scope
- no engine changes
- no gameplay/runtime changes
- no broad deployment automation
- no website publishing automation in this PR
- no game/template asset conversion automation in this PR
- no destructive repo cleanup scripts in this PR unless explicitly required for the selected scripting slice

## Required Script Behavior
### 1. Plan Mode Switching
Provide a clear script surface that can switch the repo workflow between:
- Pay-as-you-go mode
- Codex plan mode

The implementation should make the active mode explicit and easy to inspect.

### 2. API Key Input / Update
Provide a safe local script path to:
- accept or set the API key
- store/configure it in the intended local repo workflow location
- avoid noisy manual editing steps

### 3. API Key Validation
Provide a validation script that:
- checks whether key/config state is present
- validates format/basic readiness
- performs safe validation logic appropriate to the repo workflow
- reports actionable success/failure output

## Preferred Implementation Style
- PowerShell first, to reduce Codex token usage where possible
- scripts placed in a clear repo-local scripts location
- outputs and helper artifacts routed to the project folder in line with repo conventions
- keep script naming obvious and operator-friendly

## Roadmap Update Instruction
This PR must update the roadmap in two ways:

### A. Status updates
Continue updating existing roadmap status where this PR clearly advances tracked work.

### B. New roadmap items to add
Add the following roadmap items as new tracked work. Keep wording tight and consistent with the existing roadmap style.

1. Existing games asset folders should be updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates.
2. Add the ability for a PowerShell script to create a new game from template, including a project scaffold for the tools.
3. Add scripts to prep / update / delete the repo so it can be placed on a website.
4. Add scripts to switch between Pay-as-you-go and Codex plan modes, and scripts to input API key material and validate it.

These roadmap additions are explicitly requested and are allowed text additions for this PR.

## Validation Expectations
At minimum:
- touched PowerShell files parse cleanly
- plan-switch behavior is testable/inspectable
- API key input/update path is documented and deterministic
- API key validation reports clear outcomes
- no unrelated runtime/engine/tool UI work is introduced

## Acceptance Criteria
- repo contains a clear script path for plan switching
- repo contains a clear script path for API key input/update
- repo contains a clear script path for API key validation
- focused checks/documentation are included
- roadmap is updated with the requested new items plus any relevant status updates
- PR remains small and purpose-specific

## Deliverables
Return a repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_09_18_CODEX_PLAN_SWITCH_AND_API_KEY_SCRIPTING.zip`

Include:
- docs/pr/BUILD_PR_LEVEL_09_18_CODEX_PLAN_SWITCH_AND_API_KEY_SCRIPTING.md
- docs/operations/dev/codex_commands.md
- docs/operations/dev/commit_comment.txt
- docs/operations/dev/next_command.txt
- docs/reports/change_summary.txt
- docs/reports/validation_checklist.txt
