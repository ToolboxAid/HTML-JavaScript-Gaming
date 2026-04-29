# PR 11.76 Acceptance Checklist

- [ ] All files under `src/engine/utils/*` inventoried.
- [ ] All utility files moved to `src/shared/utils/*`.
- [ ] Any remaining `src/engine/utils/*` file has a documented engine-runtime dependency.
- [ ] No wrapper or alias files created.
- [ ] No duplicate utility implementations remain.
- [ ] All repo imports updated to new shared utility paths.
- [ ] Search for old engine utility imports returns zero, except documented exceptions.
- [ ] Workspace Manager opens.
- [ ] Affected tools open without console import errors.
- [ ] Full samples test skipped because this is targeted utility/import consolidation; run only if broad loader/runtime issues appear.
