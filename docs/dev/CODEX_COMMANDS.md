MODEL: GPT-5.4
REASONING: high

COMMAND:
Create `BUILD_PR_LEVEL_18_15_TRACK_F_DOCS_SYSTEM_CLASSIFICATION_FOUNDATION` as a docs-first, one-purpose PR for Track F foundation only.

Required work:
1. Scan the repo `docs/` tree only.
2. Produce:
   - `docs/dev/reports/docs_inventory_tree.txt`
   - `docs/dev/reports/docs_classification_matrix.md`
   - `docs/dev/reports/docs_bucket_rules.md`
   - `docs/dev/reports/docs_move_map_proposed.md`
   - `docs/dev/reports/BUILD_PR_LEVEL_18_15_TRACK_F_DOCS_SYSTEM_CLASSIFICATION_FOUNDATION_VALIDATION.md`
3. Classify all docs into explicit buckets.
4. Define non-overlapping bucket rules.
5. Propose move targets for later cleanup PRs without deleting historical docs.
6. Update roadmap status only if execution is complete:
   - `18. Track F – Docs System Cleanup` `[ ] -> [.]`
   - `classify all docs into buckets` `[ ] -> [x]`
7. Preserve all unrelated working-tree changes.

Hard guards:
- no implementation code
- no non-doc changes
- no doc deletion in this PR
- no roadmap rewrites
- no status jumps other than `[ ] -> [.]` or `[.] -> [x]`
- do not modify `start_of_day`
- keep scope strictly to Track F foundation

Artifact:
- package the repo-structured ZIP to:
  `<project folder>/tmp/BUILD_PR_LEVEL_18_15_TRACK_F_DOCS_SYSTEM_CLASSIFICATION_FOUNDATION.zip`
