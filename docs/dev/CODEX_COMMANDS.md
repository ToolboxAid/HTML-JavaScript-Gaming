MODEL: GPT-5.4
REASONING: high

COMMAND:
Implement BUILD_PR_LEVEL_6_1_SAMPLES_PHASE_ALIGNMENT.

Goal:
Normalize the samples area into canonical phase-based locations and update only the references required to keep sample navigation working.

Use this captured plan exactly:
1. Map every sample to a canonical `phaseXX/####` location.
2. Identify outliers/misnumbered entries and define move/rename rules.
3. Validate links/index metadata against the new phase structure.
4. Apply in one surgical delta (structure + references + verification).

Scope limits:
- samples/ only
- `samples/index.html`
- direct sample metadata or link surfaces used by `samples/index.html`
- no engine/game/tool changes
- no sample logic rewrites unless path references require them

Required steps:
1. Build an exact move-map for current sample locations to canonical `samples/phase-XX/####-*` targets.
2. Identify and resolve misnumbered/misplaced entries with exact rename targets.
3. Apply moves/renames in one pass.
4. Update `samples/index.html` and only the direct references required for navigation correctness.
5. Verify there are no broken sample-navigation references after the move.

Validation:
- every sample in scope has one canonical final location
- no duplicate/ambiguous final placements
- `samples/index.html` resolves correctly
- smoke validation for sample navigation passes

Return:
- COMPLETE repo-structured ZIP only
- path: <project folder>/tmp/BUILD_PR_LEVEL_6_1_SAMPLES_PHASE_ALIGNMENT.zip
