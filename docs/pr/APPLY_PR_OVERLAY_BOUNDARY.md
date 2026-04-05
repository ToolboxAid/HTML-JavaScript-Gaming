Toolbox Aid
David Quesenberry
04/05/2026
APPLY_PR_OVERLAY_BOUNDARY.md

# APPLY_PR_OVERLAY_BOUNDARY

## Objective
Apply only the approved boundary contract at sample integration touchpoints while preserving architecture safety.

## Approved Input
- `PLAN_PR_OVERLAY_BOUNDARY`
- `BUILD_PR_OVERLAY_BOUNDARY`

## Apply Scope
- Documentation alignment and sample-level integration guidance only.
- Reference sample: `samples/Phase 12 - Demo Games/Demo 1205 - Multi-System Demo/MultiSystemDemoScene.js`.

## Guardrails
1. No engine core changes.
2. No expansion to unrelated tools/samples.
3. No private cross-calls between console and overlay.
4. Preserve Dev Console as command/input owner.
5. Preserve Debug Overlay as passive telemetry/HUD owner.

## Apply Checklist
1. Confirm all console command/input features stay in console path.
2. Confirm all overlay visual telemetry features stay in overlay path.
3. Confirm shared interactions go through public selectors/events/adapters only.
4. Confirm no docs or guidance introduce prohibited coupling.

## Validation Checklist
- Boundary rules are unchanged and explicit.
- Allowed and prohibited interaction rules are consistent across PLAN/BUILD/APPLY.
- Ownership matrix remains intact.
- Rollout notes remain sample-level.
- No implementation code included in this docs bundle.

## Rollback Guidance
If apply review detects scope drift:
1. Revert non-doc additions.
2. Keep only boundary docs/reports.
3. Re-run checklist before repackaging.

## Expected Outcome
A clean, docs-only APPLY bundle that is ready for a later focused implementation PR without coupling drift.
