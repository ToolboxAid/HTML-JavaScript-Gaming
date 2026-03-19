PR-014 — example direction

### Supported Compatibility Surface Example Direction

Use wording like:
- This surface remains supported for current compatibility needs.
- Existing callers can continue to rely on this surface.
- This API remains part of the supported compatibility-facing engine/game surface.

Avoid wording that suggests:
- hidden deprecation
- instability
- imminent narrowing

### Compatibility Surface With Transition-Planning Note Example Direction

Use wording like:
- This surface remains supported for current compatibility use.
- Existing callers can continue using this surface while future migration planning is evaluated.
- Documentation posture for this surface may evolve over time, but no runtime change is implied here.

Avoid wording that suggests:
- immediate migration is required
- removal is approved
- breakage is expected soon

### Writing Rule

If a sentence could make a current caller think “this might break soon,” rewrite it unless an approved PR explicitly changes support policy.
