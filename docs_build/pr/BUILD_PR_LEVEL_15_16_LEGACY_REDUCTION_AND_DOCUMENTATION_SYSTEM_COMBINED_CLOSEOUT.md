# BUILD_PR_LEVEL_15_16_LEGACY_REDUCTION_AND_DOCUMENTATION_SYSTEM_COMBINED_CLOSEOUT

## Purpose
Bundle the remaining cleanup/documentation lanes into one combined pass to reduce PR count.

## Combined target lanes

### 15. Legacy Reduction
- legacy inventory completed
- keep vs migrate vs future-delete decisions recorded
- `legacy class-retention policy marker` policy defined
- `SpriteEditor_old_keep` policy defined
- archived notes policy defined
- roadmap for eventual legacy retirement defined

### 16. Documentation + Planning System
- per-component roadmap slices added only when truly needed
- structure normalization roadmap linked to future BUILD lanes
- phase descriptions normalized repo-wide

## Strategy
Treat these as one combined governance/cleanup lane:
- legacy inventory + policy decisions
- roadmap/planning documentation normalization
- future-retirement guidance
- only add per-component roadmap slices where clearly justified

## Combined scope

### A. Legacy reduction closeout
Complete the remaining legacy inventory/policy work:
- finish inventory truthfully
- record keep vs migrate vs future-delete decisions
- define class-retention marker policy
- define archived-notes policy
- finalize roadmap for eventual retirement

### B. Documentation/planning closeout
Complete the remaining planning-system residue:
- normalize phase descriptions repo-wide where still inconsistent
- link structure normalization roadmap to future BUILD lanes
- add per-component roadmap slices only where genuinely necessary
- avoid gratuitous roadmap proliferation

### C. Low-PR rule
This PR should close as many of the remaining lane items as truthfully possible in one pass.
If anything remains open:
- keep the residue very small
- report exact blockers
- aim for one final residue-only PR at most

## Desired outcome
This PR should either:
1. complete most or all of Sections 15 and 16 in one pass, or
2. leave only a very small explicit residue list

## Roadmap handling
- update status markers only
- no roadmap text rewrite

## Validation requirements
Codex must report:
- which lane items were completed
- any remaining residue
- exact blockers for anything still open
- whether one final follow-up PR can finish the combined cleanup/documentation lane

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_15_16_LEGACY_REDUCTION_AND_DOCUMENTATION_SYSTEM_COMBINED_CLOSEOUT.zip`

## Scope guard
- docs-first PR bundle
- Codex writes implementation
- combine aggressively to reduce PR count
- no unrelated repo changes
