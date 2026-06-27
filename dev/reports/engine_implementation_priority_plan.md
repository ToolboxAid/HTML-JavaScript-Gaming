# Engine Implementation Priority Plan

PR: PR_26152_168-engine-implementation-priority-plan
Date: 2026-06-02

## Scope

- Prioritized implementation order.
- Identified smallest executable engine slices.
- Identified required `src` capabilities.
- Defined first implementation lane.
- Added no runtime implementation.

## Priority Order

| Priority | Slice | Purpose | Validation Target |
| --- | --- | --- | --- |
| 1 | Object/rule schema contracts | Establish valid manifest object and rule records. | Targeted schema/contract tests only. |
| 2 | Engine manifest validation adapter | Validate manifest object/rule sections before runtime use. | Node validation with valid/invalid fixtures. |
| 3 | Runtime object factory | Convert one static object and one dynamic object into ECS entities. | Engine unit validation, no samples. |
| 4 | Rule registry interpreter skeleton | Register movement and collision rules without game-specific code. | Engine unit validation with minimal fixtures. |
| 5 | Asset/geometry binding adapter | Resolve manifest geometry/assets into runtime object creation. | Targeted loader validation. |
| 6 | No-render failure path | Reject invalid object/rule/asset data before engine start. | Negative validation proves no partial render. |
| 7 | Minimal config-driven pilot | Launch one tiny manifest-only game surface from validated data. | Targeted engine/runtime validation, no samples. |

## Smallest Executable Engine Slices

1. Add object type and rule schema definitions under the existing manifest/schema ownership surface.
2. Add fixtures for one static object, one dynamic object, one movement rule, and one collision rule.
3. Add validation that rejects missing `objectId`, invalid `objectType`, missing `ruleId`, invalid `ruleType`, and missing target refs.
4. Add an engine adapter that reads validated object/rule data without creating a game scene.
5. Add an object factory that creates ECS component data for static/dynamic records only.
6. Add movement/collision rule attachment as data, then execute only after validation.

## Required `src` Capabilities

| Capability | Location Direction | Notes |
| --- | --- | --- |
| Manifest object/rule validation adapter | `src/engine/config` or dedicated engine manifest folder | Should consume schema-validated data and report actionable failures. |
| Runtime object factory | `src/engine/ecs` or `src/engine/runtime` | Should map object declarations to `World` entities/components. |
| Rule registry | `src/engine/systems` or dedicated rule folder | Should keep rule behavior shared and data-driven. |
| Asset binding resolver | `src/engine/assets` or `src/engine/runtime` | Should resolve manifest asset ids/paths without hidden defaults. |
| Diagnostics | `src/engine/logging` and engine events | Should emit PASS/FAIL/WARN/SKIP style loader results. |

## First Implementation Lane

First lane: `manifest-object-rule-schema-validation`.

Expected work:

- Add object type schema definitions.
- Add rule registry schema definitions.
- Add valid/invalid object and rule fixtures.
- Add targeted validation proving object/rule records accept valid data and reject invalid data.
- Do not create runtime object factories yet.
- Do not launch games.
- Do not touch samples.

## Explicit Exclusions

- Samples are permanently out of scope.
- No sample work or validation.
- No user-code requirement.
- No game migration.
- No runtime implementation in this stack.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static implementation priority planning.
- contract - documentation/static next-lane definition.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no ProjectWorkspace handoff implementation changed.
- samples - permanently out of scope.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope.

## Playwright

Playwright impacted: No. This PR is docs/report-only.

## Blocker Scope

No blocker for priority planning. The first implementation lane should begin with schema/contract validation, not runtime launch.
