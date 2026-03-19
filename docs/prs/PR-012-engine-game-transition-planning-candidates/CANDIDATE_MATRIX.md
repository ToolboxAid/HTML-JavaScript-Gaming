PR-012 — transition-planning candidate matrix

### Basis

This matrix builds on the documented compatibility-retained exports and the PR-011
usage-based risk tiers.

### Candidate Labels

- `actively supported compatibility surface`
- `transition-planning candidate`

### Candidate Matrix

| Export | PR-011 Risk Tier | Label | Rationale | Later Planning Note |
| --- | --- | --- | --- | --- |
| `GameCollision` | `high risk` | `actively supported compatibility surface` | broad verified usage across engine modules, games, samples, and tests makes this an active compatibility surface for now | any future narrowing would need an explicit replacement path and staged migration plan |
| `GameObjectManager` | `medium risk` | `transition-planning candidate` | verified usage exists, but caller breadth is narrower and concentrated in engine coordination and tests | candidate for later documentation de-emphasis or migration planning once replacement guidance is clear |
| `GameObjectRegistry` | `medium risk` | `transition-planning candidate` | verified usage is limited and primarily tied to internal orchestration patterns | later work can evaluate whether registry access can be hidden behind narrower surfaces |
| `GameObjectSystem` | `high risk` | `actively supported compatibility surface` | verified usage reaches games, samples, and tests, making it risky to treat as merely legacy right now | future change would need game-facing transition planning, not silent narrowing |
| `GameObjectUtils` | `medium risk` | `transition-planning candidate` | usage is meaningful but concentrated in engine plumbing rather than broad outward-facing callers | later work can evaluate whether utility helpers can be folded into narrower documented surfaces |
| `GameUtils` | `high risk` | `actively supported compatibility surface` | high verified caller count across games, samples, and tests makes this a currently active compatibility surface | future narrowing would require staged migration guidance because caller spread is broad |

### Notes

- `actively supported compatibility surface` means the export should currently be treated as a still-important compatibility surface.
- `transition-planning candidate` means the export remains compatibility-preserved now, but should be watched for later migration planning rather than treated as a long-term preferred surface.
