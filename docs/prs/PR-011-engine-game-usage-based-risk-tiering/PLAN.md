PR-011 — engine/game usage-based risk tiering plan

### Title

PR-011 — Tier Compatibility-Retained `engine/game` Exports by Usage Risk

### Description

Docs-first planning PR for tiering the verified compatibility-retained `engine/game` exports by usage risk.

This PR follows PR-010 and narrows the next step to one purpose only:
use the verified caller evidence to assign usage-risk tiers to compatibility-retained `engine/game`
exports before any future narrowing or de-emphasis decisions.

This is planning-only.
No runtime behavior changes are included.

### PR Plan

#### Objective

Create a usage-based risk-tiering plan for the compatibility-retained `engine/game` export set that:
- builds on the verified caller evidence from PR-010
- distinguishes higher-risk compatibility surfaces from lower-risk ones
- preserves compatibility
- stays docs-first
- supports later evidence-based narrowing decisions

#### Verified Baseline

This plan uses:
- the PR-008 compatibility-retained export baseline
- the PR-010 verified caller results

#### In Scope

- define risk tiers for compatibility-retained exports
- assign a risk tier to each verified compatibility-retained export
- record concise rationale grounded in verified caller evidence
- separate high-risk active callers from lower-risk lightly used surfaces
- prepare the next docs-only BUILD_PR under `/docs/prs`

#### Candidate Risk Tiers

- high risk
- medium risk
- low risk

#### Tiering Intent

This PR is about change risk visibility, not code changes.

It should document which compatibility-retained exports appear:
- risky to narrow because they still have meaningful verified caller usage
- moderately risky because usage exists but is narrower
- lower risk because verified usage is limited or absent

#### Tiering Rules

Consider:
- number of verified caller references
- caller categories involved
- whether usage appears in games, samples, engine modules, or other callers
- whether the export looks central to retained compatibility patterns

Record:
- export name
- risk tier
- verified caller evidence summary
- short rationale

Do not:
- change code
- alter import paths
- recommend removals as if approved
- make runtime behavior changes
- collapse compatibility surfaces in this PR

### Tasks

#### Task 1 — Verified Evidence Review
Review the verified caller results from PR-010 for each compatibility-retained export.

#### Task 2 — Risk Tier Matrix
Assign each compatibility-retained export one of:
- high risk
- medium risk
- low risk

#### Task 3 — Rationale Notes
Record a short rationale tied to verified caller evidence.

#### Task 4 — Boundary Implications
Note what each risk tier implies for later documentation or narrowing work.

#### Task 5 — BUILD_PR Preparation
Prepare the next docs-only BUILD_PR under `/docs/prs` to record the usage-based risk tiers.

### Acceptance Criteria

- a usage-based risk-tiering plan exists for the compatibility-retained exports
- scope remains docs-only
- compatibility is preserved
- no runtime behavior changes are introduced
- BUILD_PR scope is ready and surgical
