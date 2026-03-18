# ToolboxAid Review Checklist v1

## Purpose

Provide a repeatable way to score files and subsystems during review.

## Scoring scale

| Score | Meaning |
| --- | --- |
| 1 | Excellent / no notable issues |
| 2 | Minor issue |
| 3 | Moderate concern |
| 4 | High concern |
| 5 | Critical issue |

## Review categories

### 1. Clarity

- Is the purpose obvious?
- Are names meaningful?
- Can the file be understood quickly?

Score: _

Notes:

- 

### 2. Responsibility

- Does the file or class do one thing well?
- Is logic mixed across rendering, physics, input, lifecycle, or data?

Score: _

Notes:

- 

### 3. Coupling

- Does it depend on too many systems?
- Are dependencies directional and clean?

Score: _

Notes:

- 

### 4. API design

- Are methods predictable?
- Are inputs and outputs consistent?
- Is the public surface obvious?

Score: _

Notes:

- 

### 5. Correctness risk

- Are there edge cases?
- Is there unsafe mutation or unclear ownership?
- Are timing or collision hazards visible?

Score: _

Notes:

- 

### 6. Performance sensitivity

- Is this in a hot path?
- Are there unnecessary allocations?
- Are calculations repeated more than necessary?

Score: _

Notes:

- 

### 7. Maintainability

- Is the code easy to modify?
- Are there hidden side effects?
- Is the file too large or too central?

Score: _

Notes:

- 

## Boundary classification

Mark the reviewed item as one of:

- **PUBLIC** — safe for games and external consumers
- **INTERNAL** — tests-only
- **PRIVATE** — file-local or module-local implementation detail

## Overall priority

- **LOW** — average 1–2
- **MEDIUM** — average around 3
- **HIGH** — average around 4
- **CRITICAL** — any area at 5 or severe architecture break

## Recommended action

- Leave as-is
- Cleanup
- Refactor
- Rewrite

## PR bucket

- Cleanup PR
- Consistency PR
- Bug Fix PR
- Performance PR
- Refactor PR
- Architecture PR
