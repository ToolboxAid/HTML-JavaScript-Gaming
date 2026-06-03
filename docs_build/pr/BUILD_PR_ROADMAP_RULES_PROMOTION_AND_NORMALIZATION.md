# BUILD_PR_ROADMAP_RULES_PROMOTION_AND_NORMALIZATION

## Purpose
Promote roadmap operational rules out of checklist items and normalize them as top-level guidance.

## Decision
These are NOT tasks. They are rules:

- repo structure work is now constrained to exact move-map BUILDs only
- remaining structure normalization should avoid broad folder churn until active shared extraction and promotion-gate work stabilize

## Required change

### A. Convert to rules
- remove checkbox format
- move to top of roadmap under a rules/guidelines section

### B. Preserve content
- no wording changes
- no deletions
- only move + format change

### C. Roadmap cleanup
- ensure no rules remain as `[ ]` or `[.]` items
- checklist should contain only actionable tasks

## Outcome
- roadmap becomes cleaner
- rules vs tasks clearly separated