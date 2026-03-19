PR-003 — migration notes

### Current State

This PR applies documentation only.

### Migration Guidance

Future code PRs may use this export classification to narrow the public API surface, but
only in later, surgical PRs with compatibility preserved unless an explicit breaking change
is approved.

### Next Recommended Direction

- inventory actual `engine/game` exports
- map each export into public, internal, or transitional
- keep any compatibility bridges transitional until usage is reviewed
