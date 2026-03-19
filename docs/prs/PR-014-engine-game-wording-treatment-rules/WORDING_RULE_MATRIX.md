PR-014 — wording rule matrix

### Basis

This matrix builds on the PR-013 documentation posture split:

- `supported compatibility surface`
- `compatibility surface with transition-planning note`

### Wording Rule Matrix

| Posture Group | Wording Goal | Preferred Language Style | Avoided Language Style | Example Direction |
| --- | --- | --- | --- | --- |
| `supported compatibility surface` | preserve compatibility confidence for current callers | clear, steady wording that says the surface remains supported for current compatibility needs | wording that implies hidden deprecation, instability, or imminent narrowing | describe the surface as supported for current compatibility scenarios while avoiding claims that it is the preferred permanent long-term boundary |
| `compatibility surface with transition-planning note` | preserve compatibility confidence while leaving room for future migration planning | cautious but stable wording that says the surface remains available and supported for compatibility, while noting that future documentation treatment may evolve | wording that implies immediate deprecation, pending removal, breakage, or approved narrowing | describe the surface as currently supported for compatibility use, with a note that future migration planning may affect how it is presented in docs |

### Rule Summary

- supported compatibility surfaces should sound stable for present callers
- transition-planning-note surfaces should sound compatibility-safe, but more cautious about future docs posture
- neither posture should imply runtime changes
