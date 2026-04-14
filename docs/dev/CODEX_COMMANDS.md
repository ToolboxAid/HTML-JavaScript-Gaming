MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_01_STRUCTURE_FINALIZATION_AND_ROADMAP_CORRECTION`.

Goals:
1. Finalize the remaining planning/definition work for roadmap section 1.
2. Re-anchor execution order to the correct top-down next lane.
3. Keep this PR docs-first and surgical.

Required work:
1. Complete the remaining section-1 definition items where possible:
   - map current folder inventory to target homes
   - define remaining move-map lanes
   - define ambiguous-name rename map where still needed
   - define legacy migration map where still needed
   - confirm structure targets and boundaries against current repo state

2. Update roadmap status markers only where truthfully supported.
   - do NOT rewrite roadmap text
   - do NOT jump to already-complete sections as the next lane
   - section 1 should become the active anchor if validation supports it

3. Produce clear handoff guidance for later implementation PRs:
   - exact move-map lanes
   - exact rename-map lanes
   - exact validation gates
   - explicit no-go areas for now

4. Final packaging step is REQUIRED:
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_01_STRUCTURE_FINALIZATION_AND_ROADMAP_CORRECTION.zip`

Hard rules:
- docs-first only
- no implementation code by ChatGPT
- no broad repo churn
- no unrelated repo changes
- no missing ZIP
