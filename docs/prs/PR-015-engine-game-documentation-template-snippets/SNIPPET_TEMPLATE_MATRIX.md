PR-015 — snippet template matrix

### Basis

This matrix builds on the PR-013 documentation posture split and the PR-014 wording-treatment rules.

### Snippet Template Matrix

| Posture Group | Snippet Purpose | Suggested Template Shape | Key Phrasing Requirements | Key Phrasing Cautions |
| --- | --- | --- | --- | --- |
| `supported compatibility surface` | short summary snippet | `{ExportName} remains supported for current compatibility needs.` | clearly state current support, preserve caller confidence, keep wording steady and factual | avoid implying hidden deprecation, instability, or imminent narrowing |
| `supported compatibility surface` | support-status snippet | `Existing callers can continue to rely on {ExportName} as a supported compatibility-facing surface.` | reassure current callers, keep wording compatibility-safe | avoid promising permanent long-term preferred status if not established |
| `supported compatibility surface` | caller reassurance snippet | `This surface remains available for current callers and compatibility scenarios.` | emphasize present support and availability | avoid wording that sounds temporary unless evidence explicitly requires it |
| `compatibility surface with transition-planning note` | short summary snippet | `{ExportName} remains supported for current compatibility use, while future documentation posture may evolve.` | preserve present support, introduce cautious forward-looking note | avoid implying immediate migration pressure or approved deprecation |
| `compatibility surface with transition-planning note` | transition-planning note snippet | `Existing callers can continue using {ExportName}; future migration planning may affect how this surface is presented in docs.` | preserve compatibility confidence, frame future change as documentation posture only unless separately approved | avoid wording that suggests runtime breakage or imminent removal |
| `compatibility surface with transition-planning note` | caller reassurance snippet | `This surface remains available for existing callers while future planning is evaluated.` | keep support confidence intact for present callers | avoid “legacy only,” “obsolete,” or “will be removed” phrasing |

### Notes

- Snippets are templates, not final docs text.
- Snippets should be adapted to context while preserving the documented posture rules.
