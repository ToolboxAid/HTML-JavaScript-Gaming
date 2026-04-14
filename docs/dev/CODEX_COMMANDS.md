MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_10_26_LEVEL_10_CLOSEOUT_SAMPLE_TOOL_NORMALIZATION_AND_SHARED_STRATEGY` as the final combined Level 10 closeout PR.

Goal:
Finish Level 10 with the fewest additional PRs by combining the remaining open section-10 work into one clean closeout.

Execute all of the following:

1. Level 10 closeout and handoff
   - validate Level 10 asset/data policy work across:
     - Asteroids
     - games/_template
     - at least one sample
     - at least one tool demo path
   - summarize results in the PR outputs

2. Sample asset ownership normalization
   - normalize sample asset ownership using the same ownership policy used for games
   - keep ownership local unless explicitly promoted
   - reduce ambiguous or duplicated sample asset placement where appropriate
   - keep changes surgical

3. Tool demo asset ownership normalization
   - normalize tool demo/demo-sample asset ownership under the same policy
   - keep demo assets local unless explicitly promoted
   - reduce ambiguous ownership and unnecessary duplication
   - preserve current tool-folder conventions

4. Promotion criteria enforcement
   - document and enforce explicit criteria for promoting an asset to shared status
   - no silent or convenience-based sharing

5. Final shared-asset strategy decision
   - explicitly finalize the top-level shared asset strategy if needed
   - if not needed, document local-first ownership with promotion-by-rule only
   - make this final enough to close the roadmap item

6. Asset duplication reduction
   - reduce clearly unnecessary duplication in the areas touched above
   - do not perform repo-wide churn
   - prefer targeted corrections

7. Roadmap handling
   - restore the correct full `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` from git history if it is not currently the full version
   - do NOT rewrite roadmap text
   - after validation, update status markers only for the section-10 items that are truly complete

8. Final validation
   - confirm whether all remaining section-10 items are now done
   - if any cannot truthfully be marked done, say so explicitly and leave only that item open

9. Final packaging step is REQUIRED
   - package ALL changed files into this exact repo-structured ZIP:
     `<project folder>/tmp/BUILD_PR_LEVEL_10_26_LEVEL_10_CLOSEOUT_SAMPLE_TOOL_NORMALIZATION_AND_SHARED_STRATEGY.zip`

Hard rules:
- fewer PRs is the priority, so combine remaining Level 10 work here
- keep changes surgical but sufficient to truly close Level 10 if validation supports it
- no unrelated repo changes
- no missing ZIP
