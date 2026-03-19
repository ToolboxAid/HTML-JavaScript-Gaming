PR-013 — documentation posture matrix

### Basis

This matrix builds on the PR-012 split of compatibility-retained exports into:
- actively supported compatibility surfaces
- transition-planning candidates

### Posture Labels

- `supported compatibility surface`
- `compatibility surface with transition-planning note`

### Posture Matrix

| Export | PR-012 Group | Documentation Posture | Rationale | Future Docs Note |
| --- | --- | --- | --- | --- |
| `GameCollision` | `actively supported compatibility surface` | `supported compatibility surface` | broad verified usage and high compatibility risk justify documenting this as still-supported for current callers | keep visible in docs as compatibility-safe, without implying preferred long-term public direction |
| `GameObjectSystem` | `actively supported compatibility surface` | `supported compatibility surface` | verified usage reaches games and samples, so docs should continue presenting it as a stable compatibility surface for now | document clearly, but keep future transition planning separate from current usage guidance |
| `GameUtils` | `actively supported compatibility surface` | `supported compatibility surface` | broad outward-facing usage across games and samples makes this a currently important compatibility anchor | keep documented as supported while avoiding claims that it is the preferred future-facing surface |
| `GameObjectManager` | `transition-planning candidate` | `compatibility surface with transition-planning note` | usage exists, but it is narrower and more plumbing-oriented, so docs should preserve it while signaling future planning attention | retain documentation, but add wording that this surface is under review for future transition planning |
| `GameObjectRegistry` | `transition-planning candidate` | `compatibility surface with transition-planning note` | verified usage is limited and orchestration-oriented, so docs should remain compatibility-safe while avoiding strong promotion | keep documented conservatively and note that future migration planning may narrow how it is presented |
| `GameObjectUtils` | `transition-planning candidate` | `compatibility surface with transition-planning note` | utility-style compatibility surface is still used, but it is a reasonable planning-watch candidate for later docs de-emphasis | preserve docs coverage, but include language that directs new usage toward narrower surfaces when available |

### Notes

- `supported compatibility surface` means the export should remain plainly documented as still-supported for current compatibility needs.
- `compatibility surface with transition-planning note` means the export remains documented and supported for compatibility now, but docs should acknowledge future migration planning posture.
