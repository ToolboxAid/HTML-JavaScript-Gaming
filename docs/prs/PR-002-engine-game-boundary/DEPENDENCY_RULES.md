PR-002 — engine/game dependency rules

### Allowed Direction
#### Allowed
- games → public `engine/game`
- public `engine/game` → stable runtime contracts
- internal `engine/game` → internal runtime details when needed
- transitional modules → old callers during migration

### Disallowed Direction
#### Disallowed
- games → internal runtime plumbing
- public `engine/game` → leaking runtime internals as public contract
- new features added to transitional wrappers
- widening compatibility bridges without explicit PR approval

### Design Rule
Dependency flow should move toward:
- game code depending on stable public orchestration
- runtime details staying internal
- transitional bridges shrinking over time
