
# BUILD_PR_RULE_EXTRACTION_AND_FINAL_NON_3D_CLOSEOUT

## Purpose
1. Extract all rule-like statements from roadmap into top Rules section.
2. Close remaining non-3D tasks using validate-first approach.

## Part A — Rule Extraction
Move any rule-like items (NOT tasks) into the Rules section:
- avoid broad repo-wide cleanup passes until active lanes stabilize
- validate-first before build
- combine PRs where possible
- no blind recreation of work
- exact-cluster extraction rules
- move-map only structure changes

Do NOT duplicate — move or consolidate.

## Part B — Validate Remaining Non-3D

Targets:

### Final Cleanup Lane
- Reduce legacy footprint after replacements are proven

### Immediate Actions
- avoid broad repo-wide cleanup passes (ensure rule, not task)

## Instructions

1. Inspect repo truth first
2. If already complete → mark complete
3. If partial → minimal completion
4. If not complete → smallest valid work only

## Constraints
- NO 3D WORK
- NO broad cleanup passes
- RULES moved, not duplicated
- roadmap text unchanged except:
  - rule promotion
  - status markers

## Output
<project folder>/tmp/BUILD_PR_RULE_EXTRACTION_AND_FINAL_NON_3D_CLOSEOUT.zip
