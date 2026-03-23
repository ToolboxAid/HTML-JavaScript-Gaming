Toolbox Aid
David Quesenberry
03/23/2026
README.md

# BUILD_PR — Engine UI Layout + Shared UI Alignment

## Purpose
Execute the shared layout CSS move and bundle nearby low-risk UI-alignment work in one larger mechanical pass.

## Goal
- move `/engine/ui/sampleLayout.css` to `/engine/ui/sampleLayout.css`
- update all sample and game HTML references
- remove the old duplicate path
- align any direct references/documentation that still mention the old path
- keep behavior unchanged

## Scope
- `samples/`
- `games/`
- `engine/ui/`
- minimal docs/reference updates only if directly tied to the move

## Constraints
- No gameplay changes
- No engine runtime logic changes
- No CSS redesign
- No new UI framework
- Keep this mechanical and behavior-preserving

## Expected Outcome
- one shared layout stylesheet lives in `engine/ui/`
- all consumers point to the new path
- no legacy copy remains
- no broken links or layout regressions

