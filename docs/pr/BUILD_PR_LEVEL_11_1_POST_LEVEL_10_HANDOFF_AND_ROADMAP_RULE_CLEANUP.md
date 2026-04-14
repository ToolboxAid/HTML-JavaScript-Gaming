
# BUILD_PR_LEVEL_11_1_POST_LEVEL_10_HANDOFF_AND_ROADMAP_RULE_CLEANUP

## Purpose
Start Level 11 and clean up roadmap misuse of rules vs tasks.

## Scope

### A. Level 11 handoff start
- confirm Level 10 complete
- establish next phase starting point

### B. Roadmap cleanup (rules vs tasks)
- remove Productization Rule section from roadmap
- ensure no rules use [ ] format

### C. Instruction migration
- move Productization Rule into PROJECT_INSTRUCTIONS.md

## Rules
- roadmap: status only
- instructions: no checkboxes

## Packaging
<project folder>/tmp/BUILD_PR_LEVEL_11_1_POST_LEVEL_10_HANDOFF_AND_ROADMAP_RULE_CLEANUP.zip

## Implementation Delta
- Removed the roadmap checkbox block under `## 11. Productization & Distribution`:
  - `### Productization Rule`
  - its two checkbox bullets
- Added productization guidance to `docs/dev/PROJECT_INSTRUCTIONS.md` as requested:
  - `## Productization Rules`
  - `- Do not create standalone showcase tracks in future roadmaps`
  - `- Fold showcase importance into the main feature or sample title when needed`

## Level 10 Completion Check
- Confirmed section `## 10. Assets & Data Policy` is fully complete (`[x]` on all seven items).
- No additional status-marker changes were needed for Level 10.

## Validation Notes
- Roadmap text was not rewritten.
- No new roadmap sections were added.
- No code files were modified.
