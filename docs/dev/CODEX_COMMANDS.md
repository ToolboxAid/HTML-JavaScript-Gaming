# Codex command for BUILD_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Execute BUILD_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION exactly as written.

EXECUTION ENVIRONMENT (MANDATORY):
- Target platform: Windows
- Prefer Node.js or vanilla JS for any scripting or generation support
- DO NOT run `npm install`
- DO NOT create `package.json`
- DO NOT create `package-lock.json`
- DO NOT create or populate `node_modules/`
- DO NOT use PowerShell for path construction, rename-heavy work, or ZIP path generation

POWERSHELL PROHIBITION (CRITICAL):
The following patterns are NOT allowed:
- "$var/path"
- "${var}/path"
- "$base\$child"
- "$($var)/path"

If any of these appear:
- STOP
- report the violation
- do not silently retry

PR PURPOSE:
Improve samples browse visuals and navigation in one narrow, testable wave.

EXPECTED TARGETS:
- `samples/index.html`
- minimal JS/CSS directly supporting thumbnails and hover preview
- minimal sample detail page files directly supporting navigation polish
- metadata-driven files directly needed for preview and navigation rendering
- reporting docs under `docs/`

DO NOT:
- modify gameplay code
- modify engine core
- change canonical paths
- broaden scope beyond browse visuals and navigation
- modify `docs/dev/start_of_day/chatGPT/`
- modify `docs/dev/start_of_day/codex/`

REQUIRED IMPLEMENTATION SHAPE:
1. Add thumbnail / preview asset support with clean fallback behavior
2. Keep hover preview lightweight and dependency-free
3. Polish next / previous / related navigation as needed
4. Preserve canonical links and metadata-driven readable UI
5. Keep changed-file count minimal

VALIDATION (REQUIRED):
- load `samples/index.html`
- verify thumbnails render when available
- verify fallback behavior when previews are missing
- verify hover preview does not break layout
- open representative sample pages and validate navigation
- confirm Phase 13 samples 1316, 1317, 1318 still load
- confirm console is clean for tested pages
- report exact files changed
- report exact validation performed

ZIP OUTPUT REQUIREMENT (HARD RULE):
- MUST produce ZIP:
  <project folder>/tmp/BUILD_PR_SAMPLES_BROWSE_VISUALS_AND_NAVIGATION.zip
- ZIP must contain only repo-relevant delta output for this PR
- Do not stage ZIP files from `<project folder>/tmp/`
- Task is NOT complete until the ZIP exists at the exact requested path

FAIL FAST:
- vague target files
- broad asset reorganization required
- preview conventions too inconsistent to implement narrowly
- navigation changes require unrelated page rewrites
- PowerShell parse issue before execution
- missing ZIP output at exact path
