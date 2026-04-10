# Codex command for BUILD_PR_SAMPLES_INDEX_AUTOGENERATION

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Execute BUILD_PR_SAMPLES_INDEX_AUTOGENERATION exactly as written.

EXECUTION ENVIRONMENT (MANDATORY):
- Target platform: Windows
- Prefer Node.js for path discovery, generation, and validation
- Python is allowed if Node.js is not the best fit
- DO NOT use PowerShell for:
  - path construction
  - directory scanning
  - bulk file moves
  - ZIP path generation

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
Auto-generate the samples index from canonical sample folders in a testable way.

EXPECTED TARGETS:
- `samples/index.html`
- exact generator/helper files required for sample index generation
- minimal supporting config/data files only if required
- reporting docs under `docs/`

DO NOT:
- modify gameplay code
- modify engine core
- perform unrelated cleanup
- broaden scope beyond sample index generation
- modify `docs/dev/start_of_day/chatGPT/`
- modify `docs/dev/start_of_day/codex/`

REQUIRED IMPLEMENTATION SHAPE:
1. Discover canonical sample folders under `samples/phaseXX/XXYY/`
2. Build or update the minimal generation path needed for `samples/index.html`
3. Preserve human-readable labels in UI
4. Fail fast on:
   - malformed sample paths
   - duplicate sample numbers
   - missing sample entry points
   - ambiguous phase/sample metadata
5. Keep changed-file count minimal

VALIDATION (REQUIRED):
- load `samples/index.html`
- verify generated tiles render
- open representative sample links:
  - first sample in a populated phase
  - last sample in a populated phase
  - Phase 13 samples 1316, 1317, 1318
- confirm console is clean for tested pages
- report exact files changed
- report exact validation performed

ZIP OUTPUT REQUIREMENT (HARD RULE):
- MUST produce ZIP:
  <project folder>/tmp/BUILD_PR_SAMPLES_INDEX_AUTOGENERATION.zip
- ZIP must contain only repo-relevant delta output for this PR
- Do not stage ZIP files from `<project folder>/tmp/`
- Task is NOT complete until the ZIP exists at the exact requested path

FAIL FAST:
- vague BUILD doc
- conflicting target files
- generator path would require broad repo analysis
- malformed canonical sample directories
- PowerShell parse issue before execution
- missing ZIP output at exact path
