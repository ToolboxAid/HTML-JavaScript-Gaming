# PR_26180_OWNER_009 Branch Validation

## Startup Validation

- Project Instructions version: 2026.06.28.009
- Repository source: PASS
- Cached memory discarded: PASS
- Canonical paths loaded: PASS
- `PROJECT_BRANCHING_POLICY.md` loaded: PASS

## Branch

- Current branch: `PR_26180_OWNER_009-move-api-application`
- Expected stacked base: `PR_26180_OWNER_008-move-www-application`
- Base ancestry check: PASS
- Worktree before build: clean on stacked base before branch creation

## Scope Validation

- Server/API runtime moved into `api/`: PASS
- Dev-only bootstrap/orchestration not moved: PASS
- Browser/www direct imports of top-level `api/` implementation avoided: PASS
- Runtime/UI product behavior changes avoided: PASS
