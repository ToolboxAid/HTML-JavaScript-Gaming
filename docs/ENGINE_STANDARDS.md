# ToolboxAid Engine Standards v1

## Purpose
Define architecture rules and coding standards for the engine.

---

## Core Principles

### 1. Engine First
The engine must behave like a reusable framework, not a game.

- No game-specific logic in engine/
- Games and samples are consumers only

---

### 2. Clear Boundaries

Every file must be identifiable as:

- PUBLIC → safe for games to use
- INTERNAL → engine-only, cross-module use
- PRIVATE → file-level or module-level only

---

### 3. Single Responsibility

- One class = one purpose
- No mixing:
  - rendering + physics
  - input + lifecycle
  - math + state mutation

---

### 4. No Hidden Side Effects

- Functions should not mutate unrelated state
- Explicit inputs and outputs
- Avoid global state unless intentional

---

### 5. Consistent API Design

- Method names are predictable
- Parameter order is consistent
- Return values are stable

---

### 6. Lifecycle Ownership

The engine must clearly control:
- initialization
- update loop
- render loop
- destruction/cleanup

No duplication of lifecycle logic.

---

### 7. Dependency Direction

Allowed:
- engine/core → subsystems
- subsystems → utils

Avoid:
- subsystems depending on games
- circular dependencies

---

### 8. Performance Awareness

Hot paths must:
- avoid allocations in loops
- minimize object creation
- reuse structures where possible

---

### 9. Backward Compatibility

- Do not break public API lightly
- Deprecate before removal
- Document changes

---

### 10. Small PR Philosophy

- One concern per PR
- No mixed changes
- Clear intent

---

## Public API Rules

Public APIs must:
- be documented
- be stable
- avoid leaking internal structures

---

## Internal Code Rules

Internal code:
- can change more freely
- must still follow structure rules
- should not be accessed by games directly
  - CanvasUtils.ctx

---

## Private Code Rules

Private code:
- scoped to file/module
- not reused externally
- safe to change anytime

---

## Red Flags

- God classes (too large)
- Duplicate utilities
- Multiple ways to do the same thing
- Hidden dependencies
- State mutation across systems
- Games accessing engine internals

---

## Review Enforcement

During PR review, check:

- Does this break boundaries?
- Does this increase coupling?
- Does this add hidden behavior?
- Is this consistent with engine patterns?

---

## Summary

The engine should be:
- predictable
- modular
- testable
- performant
- easy to extend