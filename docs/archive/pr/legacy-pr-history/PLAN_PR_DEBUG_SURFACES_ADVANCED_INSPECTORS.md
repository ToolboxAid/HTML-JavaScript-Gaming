Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS.md

# PLAN_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS

## Workflow Discipline
PLAN_PR -> BUILD_PR -> APPLY_PR

## Purpose
Define a docs-first plan for advanced shared inspector capabilities under debug surfaces while preserving strict opt-in adoption and no engine core changes.

## Requirements Alignment
- docs-first
- no engine core changes
- one PR per purpose
- shared inspector capability opt-in only
- no auto-injection into unrelated games/samples
- no hidden 3D assumptions
- roadmap updates by bracket-only edits only

## In Scope
- shared inspector host contract
- shared inspector registry contract
- inspector command bridge contract
- inspector view-model boundary contract
- ownership split: shared contracts vs project/sample adapters
- rollout/validation strategy for opt-in adoption

## Out Of Scope
- engine core API changes
- forced integration into all games/samples/tools
- default-on behavior for inspector plugins
- transport/persistence redesign
- 3D-specific assumptions as required inputs

## Ownership Model
### Shared (`src/engine/debug/inspectors`)
- host + registry contracts
- command-surface contracts
- read-only inspector view-model contracts
- explicit adapter seams

### Project/Sample/Tool Layer
- domain-specific target resolvers
- local data extractors/adapters
- local labeling and projection rules
- local opt-in wiring

### Engine Core
- no changes in this PLAN PR

## Candidate Shared Structure
```text
src/engine/debug/inspectors/
  bootstrap/
  host/
  registry/
  commands/
  viewModels/
  adapters/
```

## Candidate Inspector Commands
- inspector.help
- inspector.status
- inspector.open <inspectorId>
- inspector.close <inspectorId>
- inspector.focus <targetId>
- inspector.snapshot

## Validation Goals
- no engine core diffs required
- inspector capability remains opt-in
- no hidden 3D assumptions in shared contracts
- no auto-wiring to unrelated games/samples
- command paths flow through host/registry APIs only

## Deliverables
- docs/pr/PLAN_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS.md
- docs/pr/BUILD_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS.md
- docs/pr/APPLY_PR_DEBUG_SURFACES_ADVANCED_INSPECTORS.md
- docs/dev/CODEX_COMMANDS.md
- docs/dev/COMMIT_COMMENT.txt
- docs/dev/NEXT_COMMAND.txt
- docs/reports/change_summary.txt
- docs/reports/file_tree.txt
- docs/reports/validation_checklist.txt
