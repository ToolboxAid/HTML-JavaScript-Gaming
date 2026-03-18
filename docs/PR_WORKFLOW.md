# ToolboxAid PR Workflow v1

## Goal
Create safe, reviewable, high-quality pull requests for the engine.

---

## Core Rule

**One PR = one concern**

Do NOT mix:
- refactor
- bug fixes
- formatting
- renaming
- performance changes

---

## PR Types

### 1. Cleanup PR
- remove dead code
- extract constants
- minor renames
- no behavior changes

Risk: LOW

---

### 2. Bug Fix PR
- fixes incorrect behavior
- fixes edge cases
- includes reproduction steps

Risk: MEDIUM–HIGH

---

### 3. Refactor PR
- improves structure
- reduces coupling
- reorganizes code

Risk: MEDIUM

---

### 4. Performance PR
- optimizes hot paths
- reduces allocations
- improves loops/math

Risk: MEDIUM

---

### 5. Architecture PR
- changes system boundaries
- changes ownership
- introduces new patterns

Risk: HIGH

---

## PR Template

### Title
<type>: <short description>

Examples:
- refactor: normalize object lifecycle
- fix: collision edge case at boundaries
- perf: reduce allocations in update loop

---

### Description

#### What
What this PR changes

#### Why
Why this change is needed

#### Scope
What files/systems are affected

#### Risk
Low / Medium / High

#### Changes
- bullet list of changes

#### API Impact
- none / minor / breaking

#### Testing
- how to verify behavior

---

## Review Checklist

- [ ] Single responsibility PR
- [ ] No unrelated changes
- [ ] Public API clearly identified
- [ ] No hidden breaking changes
- [ ] Logic is easy to follow
- [ ] No unnecessary complexity
- [ ] Performance impact considered

---

## PR Order Strategy

1. Cleanup PRs (safe)
2. Consistency PRs
3. Bug fixes
4. Performance improvements
5. Refactors
6. Architecture changes

---

## Risk Guidelines

### Low Risk
- no behavior change
- internal cleanup only

### Medium Risk
- logic touched
- limited surface area

### High Risk
- lifecycle changes
- runtime flow changes
- cross-system changes

---

## Notes

- Prefer backward compatibility
- Deprecate before removing
- Keep PRs small and focused
- Use samples/games to validate changes