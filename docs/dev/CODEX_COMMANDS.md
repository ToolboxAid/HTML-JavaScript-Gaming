# Codex command for APPLY_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Execute APPLY_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION exactly as written.

EXECUTION ENVIRONMENT (MANDATORY):
- Target platform: Windows
- Prefer Node.js or vanilla JS where scripting support is needed
- DO NOT run `npm install`
- DO NOT create `package.json`
- DO NOT create `package-lock.json`
- DO NOT create or populate `node_modules/`
- DO NOT use PowerShell for path construction or ZIP path generation

APPLY RULES:
- Apply only the approved BUILD delta for browse visuals and navigation
- Do not broaden scope
- Do not modify gameplay code
- Do not modify engine core
- Do not change canonical sample paths
- Keep changed-file count minimal

REQUIRED VALIDATION:
- load `samples/index.html`
- verify thumbnails render when available
- verify missing previews fall back cleanly
- verify hover preview does not break layout
- verify next / previous / related navigation remains correct
- confirm Phase 13 samples 1316, 1317, 1318 still load
- confirm console is clean for tested pages
- report exact files changed
- report exact validation performed

ZIP OUTPUT REQUIREMENT (HARD RULE):
- MUST produce ZIP:
  <project folder>/tmp/APPLY_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION.zip
- ZIP must contain only repo-relevant delta output for this APPLY
- Do not stage ZIP files from `<project folder>/tmp/`
- Task is NOT complete until the ZIP exists at the exact requested path

FAIL FAST:
- BUILD delta exceeds approved browse visuals/navigation scope
- apply requires unrelated conflict resolution
- canonical paths would change
- missing ZIP output at exact path
