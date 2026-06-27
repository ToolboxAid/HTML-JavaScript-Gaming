# PR_26152_268 Engine V2 / V1 Gap Analysis

## Scope

- Analyze V1/existing capabilities not yet represented in Engine V2.
- Classify each gap as required, optional, obsolete, or future.
- Do not implement missing features in this PR.

## Gap Classification

| Gap | Classification | Reason |
|---|---|---|
| Real database-backed project store | Future | This stack adds the swappable contract and in-memory adapter only. PostgreSQL/DB work remains a later lane. |
| Project/tool output persistence boundary | Required | Toolbox rebuild needs a store abstraction for projects, manifests, assets, tool outputs, Custom Extensions, approvals, and publish state. Covered by PR_26152_269/270. |
| Browser storage as authoritative project store | Obsolete | `localStorage`/`sessionStorage` cannot be the authoritative project data store. |
| Asset loading/binding integration | Required later | Existing `assets/` and rendering helpers are reusable candidates, but Toolbox rebuild should wire through Project Data Store boundaries before deeper runtime binding. |
| Networking/multiplayer runtime | Future | Existing network stack is broad and should not block single-player manifest-driven Toolbox rebuild. |
| Debug overlays/automation/replay | Optional | Valuable for diagnostics, but not required before the Toolbox rebuild may begin. |
| Release/deployment packaging | Future | Publish/marketplace lanes need it; initial Toolbox rebuild only needs publish-state storage boundaries. |
| Security/auth/admin implementation | Future | Contracts and approval state exist; auth/Admin UI implementation remains out of scope. |
| OpenAI Custom Extension validation integration | Future | AI validation is advisory and contract-only; no provider integration yet. |
| Samples as validation source | Obsolete for this lane | Samples remain out of scope and must not be used as readiness blockers. |
| Hard-coded game-specific behavior | Obsolete | Engine V2 readiness is manifest-driven only. |
| Legacy Code Studio user-facing naming | Obsolete | User-facing concept is Custom Extensions. Internal technical contracts may retain existing names until explicitly renamed. |

## Required Before Toolbox Rebuild

- PASS: Engine V2 manifest-driven runtime slices exist across object, terrain, environment, rules, playable loop, media, AI, combat, possession, interaction, persistence, player systems, and Custom Extensions.
- PASS: V1/V2 inventory exists.
- PASS: Required Project Data Store contract exists.
- PASS: Required in-memory Project Data Store adapter exists.

## Remaining Required During Toolbox Rebuild

- Wire rebuilt Toolbox flows to the swappable Project Data Store contract.
- Keep tool pages independent from direct storage implementation details.
- Keep Custom Extension approvals human-gated for publish eligibility.

## Validation

- PASS: static gap analysis completed.
- PASS: `git diff --check`

## Scope Exclusions

- No missing V1 feature implementation.
- No Toolbox rebuild.
- No samples.
