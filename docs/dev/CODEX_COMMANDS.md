# Codex command for BUILD_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Execute BUILD_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION exactly as written.

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
Improve samples index responsiveness and add lightweight favorites / pinning in one narrow, testable wave.

EXPECTED TARGETS:
- `samples/index.html`
- minimal JS/CSS directly supporting index rendering, filtering, and favorites behavior
- metadata-driven files directly needed for persistence keys or rendering
- reporting docs under `docs/`

DO NOT:
- modify gameplay code
- modify engine core
- change canonical paths
- broaden scope beyond index performance and lightweight personalization
- modify `docs/dev/start_of_day/chatGPT/`
- modify `docs/dev/start_of_day/codex/`

REQUIRED IMPLEMENTATION SHAPE:
1. Improve index responsiveness without broad architectural rewrites
2. Keep filter/search correctness intact
3. Add dependency-free favorites / pinning using lightweight client-side persistence
4. Preserve canonical links and metadata-driven readable UI
5. Keep changed-file count minimal

VALIDATION (REQUIRED):
- load `samples/index.html`
- verify filter/search still works correctly
- verify repeated interactions remain responsive
- add favorites / pins and confirm they render correctly
- reload and confirm favorites / pins persist locally
- remove a favorite / pin and confirm removal persists
- confirm Phase 13 samples 1316, 1317, 1318 still load
- confirm console is clean for tested pages
- report exact files changed
- report exact validation performed

ZIP OUTPUT REQUIREMENT (HARD RULE):
- MUST produce ZIP:
  <project folder>/tmp/BUILD_PR_SAMPLES_INDEX_PERFORMANCE_AND_PERSONALIZATION.zip
- ZIP must contain only repo-relevant delta output for this PR
- Do not stage ZIP files from `<project folder>/tmp/`
- Task is NOT complete until the ZIP exists at the exact requested path

FAIL FAST:
- vague target files
- performance work requires broad rendering rewrite
- favorites requires server-side persistence
- persistence becomes coupled to unrelated systems
- PowerShell parse issue before execution
- missing ZIP output at exact path
