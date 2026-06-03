# BUILD_PR_TARGETED_REPO_CLEANUP_PASS_2

## Purpose
Introduce enforceable guard for legacy engine import paths.

## Scope
- Detect and prevent usage of:
  - /engine/
  - ../engine/
  - ./engine/

## Non-Goals
- No code rewrites
- No deletions
- No moves
- No templates changes

## Acceptance Criteria
- Guard report created
- Zero matches confirmed OR matches listed explicitly