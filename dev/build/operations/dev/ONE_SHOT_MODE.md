# One-Shot Mode

## Goal
Let ChatGPT run the full non-code workflow from a single prompt:
- validate PLAN
- create BUILD
- generate Codex command
- package ZIP

## Trigger Prompt
Run full workflow for <PLAN_PR_NAME>

Example:
Run full workflow for PLAN_PR_LEVEL_11_2_RECONCILIATION_LAYER_FOUNDATION

## Expected ChatGPT behavior
1. Read the referenced PLAN_PR
2. Validate that the PLAN is singular, specific, and executable
3. Create a compact BUILD_PR for the same scope
4. Create/update the Codex command
5. Package a repo-structured ZIP under <project folder>/tmp/
6. Return the ZIP plus a short summary

## Boundaries
- ChatGPT does docs and ZIP packaging only
- Codex writes implementation code
- One PR purpose only
- No vague language
- No repo-wide scanning unless exact targets require it
