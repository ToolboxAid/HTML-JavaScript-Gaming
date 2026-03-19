PR-017 — draft usage notes

### Fuller Block Exports

Use fuller blocks for:
- `GameCollision`
- `GameObjectSystem`
- `GameUtils`
- `GameObjectManager`

These exports benefit from stronger caller reassurance or broader compatibility context.

### Shorter Block Exports

Use shorter blocks for:
- `GameObjectRegistry`
- `GameObjectUtils`

These exports should remain documented and compatibility-safe, but with more conservative presentation.

### Writing Rules

- supported compatibility surface drafts should read as stable for present callers
- transition-planning-note drafts should preserve present support while allowing cautious future docs posture
- no draft should imply imminent breakage, approved removal, or mandatory migration

### Do Not

- mix transition-planning-note language into supported-surface drafts
- use deprecation-style warnings unless a later approved PR changes support policy
- overstate long-term guarantees beyond what has been documented
