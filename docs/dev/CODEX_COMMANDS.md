MODEL: GPT-5.4
REASONING: high

COMMAND:
- extend Validate-All.ps1
- add checks:
  - required folders exist
  - scripts in correct directories
  - optional asset structure validation
- ensure failures return non-zero exit
