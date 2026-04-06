# APPLY_PR_FINAL_ENGINE_PROMOTION

## Purpose
Apply final engine promotion by executing migration and stabilization only, with feature freeze.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## PR Purpose
One PR purpose only: complete engine-promotion migration and lock stabilized contracts.

## Apply Scope
- move remaining proven reusable debug modules to engine-owned locations
- maintain public compatibility for existing integration points
- preserve local adapter boundaries for project/sample specifics
- finalize stabilization docs and validation artifacts

## Explicitly Not Included
- no new features
- no new debug domains
- no broad architecture redesign

## Execution Order
1. apply migration map for remaining promotable modules
2. apply compatibility path updates (non-breaking)
3. validate behavior parity across existing consumers
4. finalize stabilization reports and closeout notes

## Apply Rules
- preserve existing behavior
- no destructive changes
- keep changes surgical and traceable
- feature-freeze enforced for this phase

## Validation
- syntax and integration checks for touched modules
- parity checks on representative sample/tool integrations
- rollback path remains available if regressions are detected
