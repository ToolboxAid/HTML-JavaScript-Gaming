PR-019 — first code PR shape

### Single Purpose

The first `engine/game` code PR should be a runtime-neutral alignment PR.

Its purpose is to add small, non-breaking intent comments or markers near documented `engine/game` export surfaces so the code reflects the completed docs-first architecture work without changing behavior.

### Target Outcome

After the first code PR:
- code intent is clearer to maintainers
- documented public versus compatibility-retained direction is more visible near the relevant surfaces
- runtime behavior is unchanged
- existing callers continue working without modification

### Not The Purpose

The first code PR is not for:
- cleanup bundling
- file restructuring
- import rewrites
- export narrowing
- deprecation enforcement
- behavior edits
