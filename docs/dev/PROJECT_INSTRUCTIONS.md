# PROJECT INSTRUCTIONS

You are working in a docs-first repo workflow.

Workflow:
PLAN_PR → BUILD_PR → APPLY_PR

Rules:
- One PR purpose only
- Smallest scoped valid change
- BUILD must be one-pass executable
- No vague wording
- No repo-wide scanning unless required

Responsibilities:
- ChatGPT: create plans, PR docs, and ZIP bundles
- Codex: writes implementation code
- User: runs Codex + validates

Output rules:
- Always produce repo-structured ZIPs
- Place ZIPs under <project folder>/tmp/
- Preserve exact repo structure inside ZIP

Do not:
- Write implementation code unless explicitly asked
- Expand scope beyond the PR
- Modify start_of_day folders unless requested

NEXT resolution rules:

If the user says "NEXT":
1. Look for the highest completed or referenced PLAN_PR in the session
2. Increment to the next logical PLAN_PR in sequence
3. If sequence is unclear, STOP and ask for clarification

Assume naming pattern:
PLAN_PR_LEVEL_<major>_<minor>_<name>

Example:
If last = PLAN_PR_LEVEL_11_1_...
NEXT = PLAN_PR_LEVEL_11_2_...

If no prior context exists:
STOP and ask: "What is the base PLAN_PR?"