MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_02_ENGINE_CORE_BASELINE_AND_BOUNDARY_PASS` as the first combined Section-2 PR.

Goal:
Reduce PR count by grouping the engine-core baseline work into one coherent normalization pass.

Required work:
1. Establish and normalize the engine-core boundaries/public homes for:
   - core bootstrapping
   - scene
   - rendering
   - input
   - physics
   - audio
   - systems

2. Treat these as one combined service cluster where practical:
   - timing/frame services
   - event routing
   - camera integration

3. Define/document only the necessary engine-level contracts and public boundaries needed to support the baseline pass.

4. Close as many section-2 items as truthfully possible in this one PR:
   - core bootstrapping normalized
   - scene management normalized
   - rendering layer normalized
   - input layer normalized
   - physics layer normalized
   - audio layer normalized
   - systems layer normalized
   - engine-level contracts documented
   - engine public boundaries clarified
   - timing/frame services stabilized
   - event routing stabilized
   - camera integration stabilized

5. If some items cannot truthfully be completed here:
   - leave only the true residue open
   - report exact blockers
   - keep the residue small enough for one follow-up PR if possible

6. Update roadmap status markers only.
   - do NOT rewrite roadmap text

7. Final packaging step is REQUIRED:
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_02_ENGINE_CORE_BASELINE_AND_BOUNDARY_PASS.zip`

Hard rules:
- combine work to reduce PR count
- keep changes coherent and surgical
- no unrelated repo changes
- no missing ZIP
