# BUILD_PR_LEVEL_19_11_FULL_VALIDATION_AND_PROMOTION

## Purpose
Execute full validation after:
- sample phase fix
- shared extraction guard fix
- pacman rename

Promote roadmap items to [x] if validation is clean.

## Scope
- Run full validation
- Promote only if clean
- No feature work

## Steps
1. Run:
   node ./scripts/run-node-tests.mjs
2. Run:
   npm run test:launch-smoke

4. If ALL PASS:
   Promote:
   - Track A → [x]
   - Track C → [x]
   - Track F → [x]

5. If ANY FAIL:
   Do NOT promote
   Record failures

## Acceptance
- Clean validation OR documented failures
