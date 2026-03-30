MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT as an implementation delta driven by docs only.

STRICT REQUIREMENTS:
- ALL new code MUST be created under: src/advanced/state/
- DO NOT modify or reuse:
  - engine/state/
  - samples/
  - any existing state system
- This is a NEW architectural layer

Use Level 10.6 and 10.7 docs/pr as source of truth.

Implement:
- initial state factory
- read-only selectors
- named transition stubs (no real logic)
- event helpers aligned to Level 10.4
- integration wrapper aligned to Level 10.5
- EXACTLY ONE optional consumer

Constraints:
- passiveMode = true by default
- no engine core API changes
- no cross-folder coupling
- no reuse of sample implementations

FINAL STEP:
- Package delta ZIP to:
  <project>/tmp/BUILD_PR_LEVEL_10_7_STATE_CONTRACT_IMPLEMENTATION_PILOT_delta.zip
