MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
1. Open the roadmap at:
   docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md

2. Execute the smallest real PR needed to complete Level 19 Track B:
   - validate boot -> run -> shutdown lifecycle
   - validate hot reload / reset flows
   - validate error handling paths
   - validate long-running stability

3. Search only where needed to find the existing lifecycle/runtime validation surfaces:
   - tests/
   - scripts/
   - launch smoke / runtime smoke helpers
   - engine runtime boot/reset/shutdown entry points actually used by samples/games/tools

4. Implement the minimum validation-backed changes required:
   - add/fix focused tests or validation harnesses
   - add tiny runtime lifecycle fixes only if required to make validation deterministic
   - do not create new features
   - do not perform broad repo cleanup

5. Produce reports:
   - docs/dev/reports/BUILD_PR_LEVEL_19_13_RUNTIME_LIFECYCLE_VALIDATION_summary.md
   - docs/dev/reports/BUILD_PR_LEVEL_19_13_RUNTIME_LIFECYCLE_VALIDATION_coverage.md
   - docs/dev/reports/BUILD_PR_LEVEL_19_13_RUNTIME_LIFECYCLE_VALIDATION_results.md

6. In the reports, explicitly record:
   - which lifecycle paths were exercised
   - which commands were run
   - pass/fail results
   - any remaining bounded caveats

7. Update the roadmap only for Track B items proven by this PR:
   - [x] validate boot -> run -> shutdown lifecycle
   - [x] validate hot reload / reset flows
   - [x] validate error handling paths
   - [x] validate long-running stability
   Only set to [x] if actually validated by execution in this PR.

8. Package the repo-structured ZIP to:
   <project folder>/tmp/BUILD_PR_LEVEL_19_13_RUNTIME_LIFECYCLE_VALIDATION.zip

CONSTRAINTS:
- one PR purpose only
- smallest scoped valid change
- no vague wording
- no repo-wide scanning unless required
- no roadmap-only promotion without executed validation
