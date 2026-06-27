# Config Driven Roadmap Baseline

PR: PR_26152_163-config-driven-roadmap-baseline
Date: 2026-06-02

## Scope

- Established config-driven roadmap baseline.
- Prioritized engine work required to support manifest-only games.
- Explicitly excluded samples.
- Explicitly excluded user code requirements.
- Defined the next implementation lane.
- Added no runtime implementation.

## Baseline

Manifest-only games require a validated data path from `game.manifest.json` to engine runtime without requiring game-specific JavaScript for baseline object/rule behavior. Custom game code may remain allowed for advanced features, but it must not be required for first-pass config-driven gameplay.

## Prioritized Engine Work

| Priority | Work | Output |
| --- | --- | --- |
| 1 | Manifest object type schema | Validated static/dynamic/killable/collectible/trigger/projectile/zone/UI records. |
| 2 | Manifest rule schema | Validated movement/bounce/gravity/health/damage/collision/spawn/despawn/scoring/cooldown records. |
| 3 | Engine manifest validation adapter | Runtime-visible validation that rejects invalid object/rule payloads before render. |
| 4 | Manifest object factory | Converts validated object type records into ECS entities/components. |
| 5 | Rule interpreter | Applies declarative rules through existing engine systems. |
| 6 | Error/reporting contract | Logs PASS/FAIL/WARN/SKIP outcomes for manifest-driven boot and rule execution. |
| 7 | First manifest-only pilot | One minimal game launches from manifest object/rule data without user-authored gameplay code. |
| 8 | ProjectWorkspace handoff validation | Confirms ProjectWorkspace passes explicit manifest references and owns no runtime gameplay state. |

## Explicit Exclusions

- Samples are permanently out of scope for this stack.
- No sample planning, sample validation, sample rebuild, or sample fixture work is included.
- User-authored game code is not required for the manifest-only baseline lane.
- No runtime implementation is included in this stack.
- No schema implementation is included in this stack.

## Next Implementation Lane

Next lane: `manifest-object-rule-schema-and-validation`.

Expected scope:

- Add manifest object type schema definitions.
- Add manifest rule schema definitions.
- Add targeted fixtures for valid/invalid object and rule payloads.
- Add targeted validation proving invalid object/rule payloads reject before runtime use.
- Keep ProjectWorkspace as explicit handoff coordination only.
- Keep samples out of scope.

## Readiness Criteria For Runtime Work

- Object type schema exists and validates targeted fixtures.
- Rule schema exists and validates targeted fixtures.
- Engine validation adapter can report actionable failures without rendering.
- Existing engine systems are mapped to declarative rule types.
- No silent defaults are used for manifest-required values.
- ProjectWorkspace boundary is documented in every validation report.

## Validation

Command:

```powershell
git diff --check
```

Result: PASS.

## Lanes Executed

- engine - documentation/static roadmap baseline for config-driven gameplay.
- contract - documentation/static review of manifest and ProjectWorkspace ownership boundaries.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no ProjectWorkspace handoff implementation changed.
- samples - permanently out of scope for this stack.
- recovery/UAT - no recovery behavior changed.
- Playwright - not impacted.

## Samples Decision

SKIP. Samples are permanently out of scope for this stack.

## Playwright

Playwright impacted: No. This PR is docs/report-only.

## Blocker Scope

No blocker for the roadmap baseline. Runtime work should begin only after the manifest object/rule schema validation lane is approved.
