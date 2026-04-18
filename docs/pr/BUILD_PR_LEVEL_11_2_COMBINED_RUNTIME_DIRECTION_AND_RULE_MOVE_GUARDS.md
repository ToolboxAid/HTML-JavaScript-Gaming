# BUILD_PR_LEVEL_11_2_COMBINED_RUNTIME_DIRECTION_AND_RULE_MOVE_GUARDS

## Purpose
Combined Level 11 setup PR that sets the next runtime direction and adds explicit move-guard governance for roadmap-to-instructions cleanup.

## Scope
- docs-only, no runtime code
- one compact direction/status update
- one explicit rule-move guard update

## Packaging
`<project folder>/tmp/BUILD_PR_LEVEL_11_2_COMBINED_RUNTIME_DIRECTION_AND_RULE_MOVE_GUARDS.zip`

## Applied Delta

### 1) Core Runtime Direction (compact)
- Updated one roadmap status marker to establish active direction:
  - `- [ ] Execute 2D capability polish lanes`
  - `+ [.] Execute 2D capability polish lanes`

### 2) Rule-Move Guards
- Added `## Roadmap Instruction Move Guards` in `docs/operations/dev/PROJECT_INSTRUCTIONS.md` with explicit rules:
  - move content instead of deleting during roadmap-to-instruction migration
  - destination text must exist before source removal
  - preserve wording unless rewrite is explicitly requested
  - roadmap remains status-only unless explicitly requested
  - no roadmap-content deletion during cleanup work

## Validation Notes
- Confirmed only status marker changes were made in roadmap content.
- Confirmed no roadmap prose was rewritten.
- Confirmed move-guard rules now exist in `docs/operations/dev/PROJECT_INSTRUCTIONS.md`.
- Confirmed docs-only scope (no engine/runtime/tool code edits).
