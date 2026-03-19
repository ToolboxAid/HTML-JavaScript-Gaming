PR-003 — engine/game export classification build

### Purpose

This BUILD_PR records the concrete export classification framework for `engine/game` as a docs-only patch.

It follows PR-002 boundary decisions and PR-003 planning decisions.

No runtime behavior is changed.

### Scope

#### In Scope
- docs-only export classification
- public / internal / transitional mapping framework
- GameBase alignment notes
- compatibility-preserving migration notes

#### Out of Scope
- runtime behavior changes
- file moves
- import rewrites
- renames
- deletions
- compatibility removal

### Build Intent

This PR narrows `engine/game` toward a stable game-facing surface while preserving compatibility.

`GameBase` remains the preferred public entry point.

### Review Checklist

#### Confirm
- docs are under `/docs/prs`
- scope is docs-only
- public/internal/transitional terms are consistent
- compatibility is preserved
- no execution paths are changed
