# PR_06_06_SAMPLE_ENGINE_DEPENDENCY_CLEANUP

## Purpose
Complete sample-to-engine dependency cleanup so samples consume only approved public/shared surfaces.

## Scope
- samples dependency cleanup only
- no behavior changes
- no engine logic refactors
- no sample feature additions

## Required Work
1. Inventory sample imports/usages that depend on non-public engine internals within this PR scope.
2. Build an exact cleanup map from non-public dependencies to approved public/shared surfaces.
3. Update sample consumers in scope to use only approved public/shared surfaces.
4. Remove only the direct dependency violations resolved by this PR.
5. Keep changes surgical and execution-backed.

## Constraints
- no broad repo cleanup beyond affected sample consumers
- no engine API redesign
- no sample behavior changes
- preserve runtime/sample navigation

## Deliverables
- docs/reports/sample_dependency_scan.txt
- docs/reports/dependency_cleanup_map.txt
- docs/reports/validation_checklist.txt

## Validation
- samples in scope no longer depend on non-public engine internals
- imports resolve after cleanup
- runtime/sample navigation not regressed
- impacted tests/smoke pass

## Output
<project folder>/tmp/PR_06_06_SAMPLE_ENGINE_DEPENDENCY_CLEANUP.zip
