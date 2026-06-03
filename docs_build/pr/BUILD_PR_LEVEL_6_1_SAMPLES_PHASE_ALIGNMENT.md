# BUILD PR — Level 6.1 Samples Phase Alignment

## Purpose
Normalize samples into a canonical phase-based structure with exact move targets and matching index/reference updates.

## Scope
- samples/ only
- sample index / sample metadata references only
- no engine changes
- no game changes
- no tool changes
- no sample content rewrites

## Inputs
Use the captured plan:
1. Map every sample to a canonical `phaseXX/####` location.
2. Identify outliers/misnumbered entries and define move/rename rules.
3. Validate links/index metadata against the new phase structure.
4. Apply in one surgical delta (structure + references + verification).

## Exact Required Work
1. Inventory current sample folders/files that participate in runnable sample navigation.
2. Produce an exact move-map from current locations to canonical `samples/phase-XX/####-*` targets.
3. Identify:
   - misnumbered samples
   - misplaced samples
   - duplicate/ambiguous placements
4. Update only the references required to keep navigation working:
   - `samples/index.html`
   - any sample metadata or link surfaces directly used by `samples/index.html`
5. Apply the moves/renames in one pass.
6. Run verification for broken references after moves.

## Constraints
- smallest valid change only
- one-pass executable
- no repo-wide scan beyond files required for runnable sample navigation
- do not change sample internals unless path references require it
- do not renumber without explicit canonical target mapping
- do not introduce new samples
- do not delete samples unless they are exact duplicate placeholders proven by the move-map

## Deliverables
- exact move-map
- updated `samples/index.html`
- updated direct sample link/metadata references required by the new structure
- verification notes

## Validation
- every sample in scope has one canonical target
- no ambiguous or duplicate final placements
- `samples/index.html` paths resolve to moved targets
- no broken direct references introduced by the move
- smoke validation for sample navigation passes

## Output
Return one repo-structured ZIP at:
`<project folder>/tmp/BUILD_PR_LEVEL_6_1_SAMPLES_PHASE_ALIGNMENT.zip`
