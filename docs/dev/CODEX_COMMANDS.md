MODEL: GPT-5.4
REASONING: high

COMMAND:
- ensure Validate-All.ps1 sets exit codes (0 pass, non-zero fail)
- ensure clear PASS/FAIL output
- add optional pre-commit hook example under .githooks/
- keep validation scripts under scripts/PS/validate/
- do not modify engine/runtime code
- commit format:
  description first line
  PR name last line
- update roadmap status only
