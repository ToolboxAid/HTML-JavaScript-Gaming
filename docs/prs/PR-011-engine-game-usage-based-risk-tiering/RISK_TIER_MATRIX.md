PR-011 — compatibility-retained export risk tier matrix

### Basis

This matrix uses the verified caller evidence recorded in PR-010.

### Risk Tiers

- `high risk` = widely used or used across multiple caller categories, making narrowing comparatively risky
- `medium risk` = verified usage exists but appears narrower in caller count or caller spread
- `low risk` = limited or no verified usage, making future narrowing comparatively safer

### Risk Tier Matrix

| Export | Verified Caller Summary | Risk Tier | Rationale |
| --- | --- | --- | --- |
| `GameCollision` | 11 verified callers across engine modules, games, samples, and tests | `high risk` | broad active usage across multiple categories makes direct narrowing comparatively risky without a replacement path |
| `GameObjectManager` | 2 verified callers across engine modules and tests | `medium risk` | usage is limited, but it is still part of internal engine coordination and test coverage |
| `GameObjectRegistry` | 2 verified callers across engine modules and tests | `medium risk` | usage is narrow but still tied to internal orchestration and verified tests |
| `GameObjectSystem` | 4 verified callers across games, samples, and tests | `high risk` | verified usage reaches direct game and sample callers, increasing compatibility risk for narrowing |
| `GameObjectUtils` | 5 verified callers across engine modules and tests | `medium risk` | usage is meaningful but concentrated in engine plumbing rather than broad game-facing callers |
| `GameUtils` | 8 verified callers across games, samples, and tests | `high risk` | high caller count and multiple outward-facing caller categories make this a prominent compatibility surface |

### Notes

- These tiers are documentation-only and do not authorize changes.
- Tiers describe narrowing risk, not code quality or desirability.
