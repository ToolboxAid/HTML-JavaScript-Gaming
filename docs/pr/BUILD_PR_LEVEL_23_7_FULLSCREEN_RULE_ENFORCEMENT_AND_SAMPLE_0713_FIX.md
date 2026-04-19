# BUILD_PR_LEVEL_23_7_FULLSCREEN_RULE_ENFORCEMENT_AND_SAMPLE_0713_FIX

## Purpose
Correct fullscreen drift introduced during recent sample work by enforcing the repo rule for fullscreen behavior and fixing the one allowed fullscreen sample:

- remove fullscreen behavior from all samples except `0713 - Fullscreen Ability`
- fix sample `0713 - Fullscreen Ability` so fullscreen actually fills the screen while maintaining aspect ratio

## Decision / Rule
Lock this rule into execution for samples:

- all samples must **not** use fullscreen by default
- only sample `0713 - Fullscreen Ability` may use fullscreen behavior
- any fullscreen flag, config, or engine property added to any other sample must be removed
- do **not** introduce `engine.fullscreen` or similar engine-level fullscreen flags unless explicitly required by the PR

## Immediate instruction
If the current uncommitted PR adds fullscreen to other samples:
- do **not** commit that state
- roll back those unauthorized fullscreen changes as part of this PR
- keep only the fixes required for sample 0713

## Scope
Included:
- scan samples for fullscreen-related code, flags, config, and UI triggers
- remove unauthorized fullscreen behavior from every sample other than 0713
- fix sample 0713 fullscreen behavior so it fills the available screen while maintaining aspect ratio
- validate 0713 behavior in fullscreen
- validate that all other samples no longer use fullscreen
- produce explicit reports and validation evidence

Excluded:
- no unrelated sample redesign
- no broad engine feature expansion
- no start_of_day changes
- no roadmap rewrites
- no new fullscreen system beyond what is required to make 0713 correct

## Required outputs
- `docs/dev/reports/BUILD_PR_LEVEL_23_7_FULLSCREEN_RULE_ENFORCEMENT_AND_SAMPLE_0713_FIX_FULL_SCREEN_USAGE_AUDIT.md`
- `docs/dev/reports/BUILD_PR_LEVEL_23_7_FULLSCREEN_RULE_ENFORCEMENT_AND_SAMPLE_0713_FIX_UNAUTHORIZED_REMOVALS.md`
- `docs/dev/reports/BUILD_PR_LEVEL_23_7_FULLSCREEN_RULE_ENFORCEMENT_AND_SAMPLE_0713_FIX_SAMPLE_0713_FULLSCREEN_FIX.md`
- `docs/dev/reports/BUILD_PR_LEVEL_23_7_FULLSCREEN_RULE_ENFORCEMENT_AND_SAMPLE_0713_FIX_VALIDATION.md`

## Required work

### 1. Fullscreen audit
Audit all samples for:
- `engine.fullscreen`
- fullscreen flags/config
- direct Fullscreen API usage
- fullscreen buttons or keybinds
- layout/style rules that force fullscreen-only behavior

Record:
- sample id
- fullscreen usage found
- authorized or unauthorized
- action taken

### 2. Unauthorized fullscreen removal
For every sample except 0713:
- remove fullscreen-related code/flags/config
- remove unauthorized UI hooks if they only exist to force fullscreen
- preserve unrelated sample behavior

### 3. Sample 0713 fix
For sample `0713 - Fullscreen Ability`:
- ensure fullscreen fills the screen correctly
- maintain aspect ratio
- avoid distortion
- avoid leaving unused margins caused by incorrect sizing logic
- validate both entering and exiting fullscreen
- validate resize behavior

### 4. Validation
Validation must confirm:
- only 0713 retains fullscreen capability
- 0713 fills the screen while maintaining aspect ratio
- no unauthorized fullscreen behavior remains in other samples
- no start_of_day changes
- unrelated working-tree changes preserved

## Acceptance
- unauthorized fullscreen removed from all non-0713 samples
- sample 0713 fullscreen works correctly and preserves aspect ratio
- validation proves rule enforcement
- current fullscreen drift is corrected without unrelated churn
