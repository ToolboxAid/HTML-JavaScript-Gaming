PR-017 — per-export documentation draft matrix

### Basis

This matrix builds on the approved documentation posture groups and example block families.

### Per-Export Draft Matrix

| Export | Posture Group | Recommended Block Family | Draft Emphasis Note | Draft Caution Note |
| --- | --- | --- | --- | --- |
| `GameCollision` | `supported compatibility surface` | `fuller block` | emphasize broad current compatibility support across callers | avoid implying that support is temporary or under active deprecation |
| `GameObjectSystem` | `supported compatibility surface` | `fuller block` | emphasize that current callers in games and samples can continue relying on this surface | avoid language that sounds like a warning banner or hidden phase-out |
| `GameUtils` | `supported compatibility surface` | `fuller block` | emphasize broad compatibility-facing utility support for existing callers | avoid wording that over-promises permanent preferred status |
| `GameObjectManager` | `compatibility surface with transition-planning note` | `fuller block` | emphasize current support for existing callers while noting future docs posture may evolve | avoid implying immediate migration pressure or removal |
| `GameObjectRegistry` | `compatibility surface with transition-planning note` | `shorter block` | emphasize current compatibility availability with conservative wording | avoid promoting it as a preferred future-facing surface |
| `GameObjectUtils` | `compatibility surface with transition-planning note` | `shorter block` | emphasize continued support for current compatibility use while leaving room for later docs refinement | avoid “legacy only” or “do not use” phrasing |

### Notes

- fuller blocks are used where caller reassurance or broader support context matters more
- shorter blocks are used where conservative compatibility wording is enough without extra emphasis
