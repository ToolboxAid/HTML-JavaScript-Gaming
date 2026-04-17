MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
1. Open the roadmap at:
   docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md

2. Execute the smallest real PR needed to complete Level 19 Track D:
   - ensure all systems expose debug data

3. Search only where needed:
   - existing debug providers
   - debug panels / registries
   - rendering/input/physics/state/replay/networking runtime data surfaces
   - focused tests validating debug exposure

4. Verify debug-data exposure for:
   - rendering
   - input
   - physics
   - state/replay
   - networking

5. If any target system is missing exposure, apply the smallest valid fix:
   - add minimal provider output or wiring
   - add/update focused tests proving the data reaches the existing debug surface
   - do not add new features or broad UX changes

6. Run validation using the deduplicated command set:
   - node ./scripts/run-node-tests.mjs
   - npm run test:launch-smoke only if needed for runtime/debug coverage

7. Produce reports:
   - docs/dev/reports/BUILD_PR_LEVEL_19_15_DEBUG_OBSERVABILITY_VALIDATION_summary.md
   - docs/dev/reports/BUILD_PR_LEVEL_19_15_DEBUG_OBSERVABILITY_VALIDATION_coverage.md
   - docs/dev/reports/BUILD_PR_LEVEL_19_15_DEBUG_OBSERVABILITY_VALIDATION_results.md

8. In the reports, record:
   - which systems were checked
   - what debug data each system exposes
   - files changed
   - commands run
   - pass/fail results
   - any bounded caveats

9. Update the roadmap only if this PR proves the remaining Track D item:
   - [x] ensure all systems expose debug data

10. Package the repo-structured ZIP to:
   <project folder>/tmp/BUILD_PR_LEVEL_19_15_DEBUG_OBSERVABILITY_VALIDATION.zip

CONSTRAINTS:
- one PR purpose only
- smallest scoped valid change
- no vague wording
- no repo-wide scanning unless required
- do not run both npm test and node ./scripts/run-node-tests.mjs when they cover the same suite
- no roadmap-only promotion without executed validation
