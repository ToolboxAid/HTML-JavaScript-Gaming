# Standard Codex Execution Template

Use this block in every BUILD PR `docs/dev/codex_commands.md`.

```md
MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Execute <BUILD_PR_NAME> exactly as written.

EXECUTION ENVIRONMENT (MANDATORY):
- Target platform: Windows
- Prefer Node.js for path, rename, move, and ZIP-related work
- Python is allowed if Node.js is not the best fit
- DO NOT use PowerShell for:
  - path construction
  - directory renaming
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

EXECUTION RULES:
- Read only the BUILD doc, exact target files, and immediate dependencies
- Keep the changed-file count minimal
- Do not broaden scope
- Do not refactor outside the BUILD purpose
- Preserve behavior unless the BUILD explicitly changes behavior
- Do not modify `docs/dev/start_of_day/chatGPT/`
- Do not modify `docs/dev/start_of_day/codex/`

ZIP OUTPUT REQUIREMENT (HARD RULE):
- MUST produce ZIP:
  <project folder>/tmp/<BUILD_PR_NAME>.zip
- ZIP must contain only repo-relevant output for this PR
- Do not stage ZIP files from `<project folder>/tmp/`
- Task is NOT complete until the ZIP exists at the exact requested path

VALIDATION REQUIREMENT:
- Run only the validation explicitly required by the BUILD
- Report exact files changed
- Report exact validation performed
- Report ZIP output path

FAIL FAST:
- vague BUILD doc
- conflicting target files
- duplicate rename targets
- numbering ambiguity
- stale hardcoded links with no exact target list
- any PowerShell parse issue before execution
- missing ZIP output at exact path
```
