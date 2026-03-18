# ToolboxAid PR Workflow v1

## Goal

Create safe, reviewable pull requests for the engine and supporting docs.

## Core rule

**One PR = one concern**

Do not mix:

- refactor
- bug fixes
- formatting
- broad renaming
- architecture rewrites
- performance tuning

## PR types

### Cleanup PR

Examples:

- remove dead code
- extract constants
- minor naming cleanup
- comment or docs alignment

Risk: **Low**

### Bug Fix PR

Examples:

- fix incorrect behavior
- fix boundary conditions
- fix lifecycle or collision defects

Risk: **Medium to High**

### Refactor PR

Examples:

- reduce coupling
- split a large class
- normalize subsystem ownership

Risk: **Medium**

### Performance PR

Examples:

- reduce allocations in hot loops
- cache repeated calculations
- lower render or collision overhead

Risk: **Medium**

### Architecture PR

Examples:

- change runtime ownership
- change boundaries between subsystems
- introduce or remove cross-system abstractions

Risk: **High**

## PR title style

```text
<type>: <short description>
```

Examples:

- `refactor: normalize object lifecycle`
- `fix: resolve collision boundary edge case`
- `perf: reduce allocations in update loop`
- `docs: consolidate review workflow`

## PR description template

### What

What this PR changes.

### Why

Why the change is needed.

### Scope

Which files or systems are affected.

### Risk

Low / Medium / High

### Changes

- bullet list of intentional changes

### API impact

- none
- minor
- breaking

### Testing

How behavior was verified.

## Review checklist

- [ ] Single-responsibility PR
- [ ] No unrelated edits
- [ ] Public API impact is explicit
- [ ] No hidden breaking changes
- [ ] Logic is easy to follow
- [ ] Risk level is stated
- [ ] Validation steps are included

## Recommended PR order

1. docs and boundary clarification
2. cleanup
3. consistency alignment
4. bug fixes
5. performance improvements
6. refactors
7. architecture changes

## Compatibility notes

- Prefer backward compatibility for public APIs.
- Deprecate before removing.
- Keep PRs small enough for human review.
- Validate changes against samples, games, and tests where applicable.
