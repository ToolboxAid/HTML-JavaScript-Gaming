PR-018 — compatibility invariants

### Invariants The First Code PR Must Preserve

- all documented compatibility-retained exports remain present
- no import paths change
- no caller-visible runtime behavior changes
- no file-location changes for engine/game surfaces
- documented supported compatibility surfaces remain untouched functionally
- documented transition-planning candidates remain available to existing callers

### Review Questions

- would an existing caller need to change imports after this PR?
- would an existing caller observe different behavior after this PR?
- would an existing caller lose access to a documented compatibility-retained export?
- does this PR do anything beyond runtime-neutral alignment?

If any answer is yes, the PR is out of bounds for the first code step.
