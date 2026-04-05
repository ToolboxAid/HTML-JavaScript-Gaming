# BUILD_PR_DEBUG_SURFACES_PROMOTION

## Purpose

Turn the promotion plan into a docs-only extraction bundle that is ready for Codex implementation.

## Build Scope

Produce docs that define:

- final target folder structure
- exact ownership mapping
- migration sequence
- implementation boundaries
- validation and rollback strategy

## Required Deliverables

- ownership matrix
- target tree
- migration checklist
- validation checklist
- change summary
- Codex command
- commit comment
- next command

## Build Rules

- one PR purpose only
- docs-first only
- no direct runtime implementation in this bundle
- keep engine-core changes minimal
- assume `engine-debug` is the primary target
- preserve sample-level proving path through `MultiSystemDemoScene.js`

## Expected Build Output

- `docs/pr/PLAN_PR_DEBUG_SURFACES_PROMOTION.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_PROMOTION.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_PROMOTION.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/next_command.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`
