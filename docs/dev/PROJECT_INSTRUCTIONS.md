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
