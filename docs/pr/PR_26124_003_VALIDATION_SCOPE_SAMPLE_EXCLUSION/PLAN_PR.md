# PLAN_PR — PR_26124_003

## Goal
Adjust current tool-completion validation scope so sample-launch requirements are excluded until sample JSON is schema-compliant.

## Scope
- `docs/dev/*`
- Playwright tests only if they currently depend on sample JSON

## Plan
1. Update validation documentation wording to remove sample-launch requirement from this lane.
2. Add explicit note that sample validation is deferred to a dedicated PR after tool completion.
3. Check Playwright tests for sample JSON dependency.
4. Modify Playwright tests only if dependency exists.
5. Run `npm run test:workspace-v2`.
