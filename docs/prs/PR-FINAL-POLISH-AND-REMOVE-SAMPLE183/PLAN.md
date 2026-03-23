Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Final Polish + Remove Unnecessary Sample183

## Goal
Finish with a small, honest polish pass and delete `samples/sample183-asteroids-game/` if it is unnecessary or misleading, while keeping the repo truthful and release-ready.

## In Scope
- `samples/sample183-asteroids-game/`
- `samples/index.html`
- any direct sample/docs references to Sample183
- minimal repo polish only where it improves truthfulness or usability

## Out of Scope
- engine/runtime changes
- gameplay changes
- new sample framework work
- promotion/extraction work
- broad documentation rewrite

## Required Changes

### 1. Remove unnecessary Sample183
If `samples/sample183-asteroids-game/` is only a misleading endpoint and adds no meaningful bridge value, delete it.

Also remove or update any direct references so the repo remains accurate.

Preferred outcome:
- delete unnecessary sample
- keep the sample ladder truthful
- avoid fake bridge artifacts

### 2. Keep sample index honest
Update `samples/index.html` so:
- no dead Sample183 entry remains
- numbering/titles/navigation stay accurate enough for the current repo state
- nothing suggests the deleted sample still exists

### 3. Final polish
Apply only small, justified polish such as:
- removing stale references
- tightening obvious wording around the sample ladder if needed
- ensuring repo-facing sample references are truthful

Do not expand into a general cleanup pass.

### 4. Validation
Validate:
- affected sample navigation still works
- no broken links remain for Sample183
- no engine/runtime files changed

## Acceptance Criteria
- unnecessary `samples/sample183-asteroids-game/` is removed
- `samples/index.html` and direct references are accurate
- no fake replacement is introduced
- no engine/runtime/gameplay changes are made
- polish stays small and truthful
