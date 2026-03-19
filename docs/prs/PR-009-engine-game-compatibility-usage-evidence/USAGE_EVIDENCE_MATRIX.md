PR-009 — compatibility usage evidence matrix

### Basis

This matrix is for recording verified caller evidence for the PR-008 compatibility-retained
`engine/game` exports.

### Verified Compatibility-Retained Exports

- `GameCollision`
- `GameObjectManager`
- `GameObjectRegistry`
- `GameObjectSystem`
- `GameObjectUtils`
- `GameUtils`

### Evidence Matrix

| Export | Caller File | Caller Category | Reference Type | Factual Note |
| --- | --- | --- | --- | --- |
| `GameCollision` | To be recorded from verified caller scan | `games` / `samples` / `engine` / `other` | `direct import` / `namespace import usage` / `indirect visible reference` | Facts only |
| `GameObjectManager` | To be recorded from verified caller scan | `games` / `samples` / `engine` / `other` | `direct import` / `namespace import usage` / `indirect visible reference` | Facts only |
| `GameObjectRegistry` | To be recorded from verified caller scan | `games` / `samples` / `engine` / `other` | `direct import` / `namespace import usage` / `indirect visible reference` | Facts only |
| `GameObjectSystem` | To be recorded from verified caller scan | `games` / `samples` / `engine` / `other` | `direct import` / `namespace import usage` / `indirect visible reference` | Facts only |
| `GameObjectUtils` | To be recorded from verified caller scan | `games` / `samples` / `engine` / `other` | `direct import` / `namespace import usage` / `indirect visible reference` | Facts only |
| `GameUtils` | To be recorded from verified caller scan | `games` / `samples` / `engine` / `other` | `direct import` / `namespace import usage` / `indirect visible reference` | Facts only |

### Evidence Rules

- record only verified caller evidence
- record the actual caller file path
- keep notes factual and concise
- do not interpret usage as removal guidance in this PR
