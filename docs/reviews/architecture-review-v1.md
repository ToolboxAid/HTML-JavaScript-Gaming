# Architecture Review v1

## Status

Active.

## Scope

Repository-wide architecture review with an engine-first approach.

## Goals

- identify public, internal, and private boundaries
- map subsystem ownership
- detect coupling and duplication
- generate small, safe PR candidates

## Initial review order

1. `engine/core`
2. `engine/game`
3. lifecycle and object base classes
4. `engine/animation`
5. `engine/render`
6. `engine/input`
7. `engine/physics`
8. `engine/math`
9. `engine/messages`
10. `engine/output`
11. `engine/utils`
12. `tests`
13. `samples`
14. `games`
15. `tools`
16. docs alignment

## Boundary review standard

For each reviewed area, answer:

- What is public?
- What is internal?
- What is private?
- Who owns state?
- Who owns lifecycle?
- Who depends on it?
- What should it depend on?
- Is it safe to change without breaking consumers?

## Current findings

### Repo-level review state

Pending direct code review.

### Cross-cutting issues

Pending.

## Risk map

### High risk

- runtime orchestration
- object lifecycle ownership
- collision and registry coordination

### Medium risk

- render subsystem
- input subsystem
- animation and physics sequencing

### Lower risk

- isolated utilities
- docs-only changes
- self-contained tools

## Task lanes

### A. Engine inventory

- list all engine folders
- classify boundary level
- identify likely public surface

### B. Core runtime review

- identify entry points
- identify update and render owners
- evaluate runtime context / state ownership

### C. Subsystem review

- responsibility
- dependencies
- coupling
- boundary classification

### D. Consumer review

- compare `samples/` and `games/`
- detect engine API leakage or bypassing

### E. Test alignment

- map tests to public surfaces
- identify hard-to-test architecture

## PR candidate log

Pending.
