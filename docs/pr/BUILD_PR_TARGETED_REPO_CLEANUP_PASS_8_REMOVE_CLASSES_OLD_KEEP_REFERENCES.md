# BUILD_PR_TARGETED_REPO_CLEANUP_PASS_8_REMOVE_CLASSES_OLD_KEEP_REFERENCES

## Purpose
Surgically remove all documentation references to `legacy class-retention policy marker` based on prior REMOVE decision.

## Scope
Docs-only removal. No structural/runtime changes.

## Required Work
1) Locate all docs references to `legacy class-retention policy marker`
2) Remove or rewrite lines to eliminate the term
3) Keep meaning intact where needed (no ambiguity introduced)
4) Do NOT create any folder
5) Do NOT touch templates/, docs/archive/, or start_of_day/*

## Deliverables
- removal_change_log.md
- BUILD report
- validation_checklist.txt

