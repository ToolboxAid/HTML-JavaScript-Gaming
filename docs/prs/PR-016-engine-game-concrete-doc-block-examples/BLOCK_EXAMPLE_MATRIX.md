PR-016 — concrete documentation block example matrix

### Basis

This matrix builds on the approved documentation posture groups:

- `supported compatibility surface`
- `compatibility surface with transition-planning note`

### Block Example Matrix

| Posture Group | Example Block Purpose | Recommended Block Parts | Ordering Guidance | Key Phrasing Requirements | Key Cautions |
| --- | --- | --- | --- | --- | --- |
| `supported compatibility surface` | fuller documentation block | export heading, short summary, support-status sentence, caller reassurance sentence | heading → summary → support-status → reassurance | clearly affirm current support and compatibility safety | avoid temporary-sounding or unstable wording |
| `supported compatibility surface` | shorter documentation block | export heading, short summary, support-status sentence | heading → summary → support-status | keep concise while preserving caller confidence | avoid language that sounds like hidden deprecation |
| `compatibility surface with transition-planning note` | fuller documentation block | export heading, short summary, support-status sentence, caller reassurance sentence, transition-planning sentence | heading → summary → support-status → reassurance → transition-planning note | preserve present support while adding a cautious future-docs note | avoid implying immediate migration pressure or removal |
| `compatibility surface with transition-planning note` | shorter documentation block | export heading, short summary, transition-planning sentence | heading → summary → transition-planning note | keep compatibility confidence intact while signaling posture review | avoid turning the block into a deprecation warning |

### Notes

- These are example block shapes for future docs writing.
- Final docs text should preserve the approved wording-treatment rules from PR-014.
