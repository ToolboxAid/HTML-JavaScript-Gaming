MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Apply and validate the existing Level 11.4 rewind execution implementation in `games/network_sample_c` only.

Perform:
- targeted import checks
- targeted smoke checks for rewind prep and replay
- manual validation support for W/X controls and debug outputs
- surgical fixes only if validation reveals a defect

DO NOT:
- modify engine core APIs
- create or edit documentation
- expand scope beyond `network_sample_c`
