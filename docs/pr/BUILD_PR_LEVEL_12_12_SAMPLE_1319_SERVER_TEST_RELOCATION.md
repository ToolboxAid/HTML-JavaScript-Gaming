# BUILD_PR_LEVEL_12_12_SAMPLE_1319_SERVER_TEST_RELOCATION

## Purpose
Relocate 1319 server `.mjs` runtime files from `server/` to `tests/` to align with repo testing/runtime conventions.

## One PR Purpose Only
File relocation + path correction only.

## Problem
Current structure places executable `.mjs` under:
- samples/phase-13/1319/server/

This conflicts with repo pattern where executable/test runtimes belong under:
- tests/

## Required Changes

### Move Files
From:
- samples/phase-13/1319/server/*.mjs

To:
- tests/network-sample-1319/*.mjs

### Update References
- Update ALL references to new paths
- Update README instructions
- Update any launch scripts

### Keep Structure Clean
- server/ may retain configs (docker, docs)
- executable runtime goes to tests/

## Rules
- No logic changes
- No behavior changes
- Path updates only

## Validation

### Path Validation
- no remaining references to old server/*.mjs paths

### Runtime Validation
- server starts from new tests/ path
- sample 1319 still connects correctly
- dashboard still functional

### Regression
- no breakage to sample launcher
- no breakage to other samples

## Acceptance Criteria
- .mjs files relocated
- all references updated
- runtime still works
