# Level 20 Track A Release Criteria

## Scope
This criteria set defines the minimum release gate for Track A (Release Readiness).

## Criteria
1. Release criteria are documented and versioned in-repo.
2. Build pipeline command set is defined and executable from repo root.
3. Deployment scripts are validated with execution evidence.
4. Deployment verification reports show `passed=true` and `failedCheckCount=0`.
5. Deployment cleanup confirms staged site removal and metadata cleanup path.

## Required evidence
1. Script structure validation pass.
2. Deployment prep run output with generated plan.
3. Deployment update run output with verification report.
4. Deployment clean run output with staged content removed.

## Gate rule
Track A may move to `[x]` only when all criteria above are execution-backed in the same PR.
