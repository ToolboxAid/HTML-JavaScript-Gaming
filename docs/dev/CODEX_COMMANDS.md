MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute `docs/pr/BUILD_PR_SHARED_EXTRACTION_51_STATE_SAMPLE_TOFINITENUMBER_MIGRATION.md` exactly as written.

Requirements:
- modify only these code files:
  - `src/advanced/state/transitions.js`
  - `samples/shared/worldGameStateSystem.js`
- use existing helper from:
  - `src/shared/math/numberNormalization.js`
- remove local `toFiniteNumber(value, fallback = 0)` implementations from both target files
- add correct shared imports
- preserve behavior
- fail fast if the shared export is missing or if extra files would be required

Package output to:
- `<project folder>/tmp/BUILD_PR_SHARED_EXTRACTION_51_STATE_SAMPLE_TOFINITENUMBER_MIGRATION_delta.zip`
