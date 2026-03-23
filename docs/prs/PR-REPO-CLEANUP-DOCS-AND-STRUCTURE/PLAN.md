Toolbox Aid
David Quesenberry
03/23/2026
PLAN.md

# BUILD_PR — Repo Cleanup (Docs + Structure)

## Goal
Remove unnecessary documentation and folders while preserving only high-value, accurate, and current docs.

## In Scope
- all `.md` and `.txt` files
- documentation folders
- unused directories
- README and core docs updates

## Out of Scope
- engine/runtime changes
- gameplay changes
- code refactors

## Required Changes

### 1. Identify required docs (keep list)
Keep only:
- root `README.md`
- architecture overview (if still relevant)
- any required setup/run instructions
- essential developer guides (if still accurate)

### 2. Remove unnecessary docs
Delete:
- old PR artifacts (PLAN.md, TASKS.md, CODEX_COMMANDS.md, etc.)
- temporary working docs
- outdated guides
- duplicate or redundant files
- low-value `.txt` files

### 3. Remove unnecessary folders
Delete:
- empty folders
- obsolete doc folders
- temp/build artifact folders (if present)

### 4. Update remaining docs
Ensure:
- README reflects current repo (engine + samples + Asteroids)
- no references to removed samples (e.g., sample183)
- no outdated workflows
- no stale architecture claims

### 5. Keep docs minimal
Prefer:
- fewer, clearer documents
- no duplication
- no speculative content

## Acceptance Criteria
- unnecessary `.md` and `.txt` files removed
- repo folders reduced to meaningful structure
- README and remaining docs are accurate
- no references to removed artifacts
- no runtime/code changes
