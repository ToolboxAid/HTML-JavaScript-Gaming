# PR_26171_ALPHA_048-idea-project-journey-execution-flow PLAN

## Purpose
Wire the creator execution flow from a Ready Idea through Game Hub into editable Game Journey items.

## Source of Truth
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/PROJECT_MULTI_PC.txt`

## Team Ownership
- Team Alpha owns Idea, Game Hub, and Game Journey work.

## Scope
- Ready Idea -> Create Project -> Game Hub -> Game Journey.
- Project and Archived Idea locking remains read-only for Idea, Pitch, and Notes.
- Game Hub displays Source Idea/Pitch/Notes read-only.
- Game Journey receives editable Journey Items generated from Idea Notes.
- Original Idea Notes are not mutated or moved.
- Add Open Journey action from Game Hub where appropriate.

## Out of Scope
- Game Journey image wiring.
- Game Hub table polish unrelated to execution flow.
- Real database persistence or schema changes.
- Full samples smoke.
