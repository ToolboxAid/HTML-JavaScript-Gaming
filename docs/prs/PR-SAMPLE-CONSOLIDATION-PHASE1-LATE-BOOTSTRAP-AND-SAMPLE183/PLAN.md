Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Sample Consolidation Phase 1: Late Bootstrap + Sample183

## Goal
Reduce repeated late-sample bootstrap duplication in a sample-owned way and resolve the empty `sample183-asteroids-game` endpoint without misleading the repo about what is actually implemented.

## In Scope
- repeated bootstrap patterns in later sample entry files
- `samples/_shared/` only if a small shared helper is justified
- `samples/sample183-asteroids-game/`
- `samples/index.html` if required
- focused validation only as needed for sample integrity

## Out of Scope
- engine/runtime changes
- gameplay changes
- broad sample history rewrites
- promotion/extraction work
- creating a new sample framework

## Required Changes

### 1. Late-sample bootstrap consolidation
Identify repeated browser/bootstrap setup in later samples and consolidate only the clearly duplicated portion into sample-owned shared infrastructure.

Keep consolidation:
- narrow
- optional/adoptive where practical
- outside `engine/`

Avoid:
- rewriting many samples for style only
- introducing a complex bootstrap framework

### 2. Resolve Sample183 truthfully
`sample183-asteroids-game` must no longer be an empty misleading endpoint.

Acceptable outcomes:
- a real bridge sample that honestly points to or demonstrates the Asteroids game relationship, OR
- removal/redirect/update so the sample ladder truthfully reflects the repo state

Do not create a fake placeholder that suggests more than exists.

### 3. Preserve sample behavior
Existing late samples must continue to run the same way after consolidation.

### 4. Focused validation
Add/update only the validation needed to prove:
- affected samples still boot
- shared sample bootstrap stays sample-owned
- Sample183 is truthful and non-empty/misleading

## Acceptance Criteria
- repeated late-sample bootstrap duplication is reduced
- any shared helper lives under sample-owned infrastructure
- Sample183 is truthfully resolved
- `samples/index.html` remains accurate if touched
- no engine changes are introduced
