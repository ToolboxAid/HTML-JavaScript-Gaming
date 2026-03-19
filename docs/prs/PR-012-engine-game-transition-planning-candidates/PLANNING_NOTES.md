PR-012 — planning notes

### Summary

The compatibility-retained exports currently split into two groups:

#### Actively supported compatibility surfaces
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`

#### Transition-planning candidates
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectUtils`

### Architecture Direction

This split supports the current `GameBase`-centered direction by:
- keeping heavily used compatibility surfaces stable for now
- identifying narrower or more plumbing-oriented surfaces for future migration planning
- avoiding premature narrowing while evidence still shows active compatibility use

### Planning Implications

- actively supported compatibility surfaces should remain clearly documented as still-important compatibility anchors
- transition-planning candidates should be the first group reviewed for future documentation de-emphasis or migration-path design
- no label here authorizes direct runtime changes
