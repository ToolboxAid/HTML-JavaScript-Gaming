PR-011 — verified caller evidence summary

### Summary By Export

#### High risk
- `GameCollision`
  - 11 verified callers
  - categories: engine modules, games, samples, tests
- `GameObjectSystem`
  - 4 verified callers
  - categories: games, samples, tests
- `GameUtils`
  - 8 verified callers
  - categories: games, samples, tests

#### Medium risk
- `GameObjectManager`
  - 2 verified callers
  - categories: engine modules, tests
- `GameObjectRegistry`
  - 2 verified callers
  - categories: engine modules, tests
- `GameObjectUtils`
  - 5 verified callers
  - categories: engine modules, tests

#### Low risk
- none based on the current verified caller scan

### Boundary Implications

- high-risk exports should be treated as active compatibility surfaces
- medium-risk exports may be candidates for later de-emphasis, but only with evidence-backed transition planning
- no compatibility-retained export currently qualifies as low risk from the verified caller scan
