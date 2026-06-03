# BUILD PR — Level 6.3 Sample Shared Boundaries

## Purpose
Enforce clear boundaries between samples, shared, and engine.

## Scope
- samples/ only (analysis + minimal moves if needed)
- no engine changes

## Changes
- identify reusable utilities in samples
- mark candidates for shared (no promotion in this PR)
- isolate sample-only logic
- ensure no sample directly depends on non-public engine internals

## Validation
- no boundary violations
- samples remain runnable
- no engine changes

## Output
<project folder>/tmp/BUILD_PR_LEVEL_6_3_SAMPLE_SHARED_BOUNDARIES.zip
