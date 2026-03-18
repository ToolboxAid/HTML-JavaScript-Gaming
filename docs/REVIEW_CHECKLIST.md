# ToolboxAid Review Checklist v1

## Purpose
Provide a consistent, repeatable way to review files across the engine.

Used for:
- Architecture reviews
- PR validation
- Refactor prioritization

---

## Scoring System (1–5)

| Score | Meaning |
|------|--------|
| 1 | Excellent / no issues |
| 2 | Minor issues |
| 3 | Moderate concern |
| 4 | High concern |
| 5 | Critical issue |

---

## Review Categories

### 1. Clarity
- Is the purpose obvious?
- Are names meaningful?
- Can this be understood quickly?

Score: _

Notes:
-

---

### 2. Responsibility
- Does this file/class do one thing?
- Is logic mixed (render + physics + input)?

Score: _

Notes:
-

---

### 3. Coupling
- Does this depend on too many other systems?
- Are dependencies clean?

Score: _

Notes:
-

---

### 4. API Design
- Are methods predictable?
- Are inputs/outputs consistent?

Score: _

Notes:
-

---

### 5. Correctness Risk
- Any edge cases?
- Mutation issues?
- timing/collision risks?

Score: _

Notes:
-

---

### 6. Performance Sensitivity
- Is this in a hot path?
- Any unnecessary allocations?
- repeated calculations?

Score: _

Notes:
-

---

### 7. Maintainability
- Easy to modify?
- Too many responsibilities?
- hidden side effects?

Score: _

Notes:
-

---

## Overall Priority

- LOW (1–2 avg)
- MEDIUM (3 avg)
- HIGH (4 avg)
- CRITICAL (5 anywhere)

---

## Recommended Action

- Leave as-is
- Cleanup
- Refactor
- Rewrite

---

## PR Bucket

- Cleanup PR
- Consistency PR
- Bug Fix PR
- Performance PR
- Refactor PR
- Architecture PR