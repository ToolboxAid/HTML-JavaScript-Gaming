PR-014 — preferred and avoided language

### Supported Compatibility Surface

#### Prefer
- supported for current compatibility needs
- remains available for current callers
- compatibility-safe surface
- supported compatibility-facing API
- still supported for existing usage patterns

#### Avoid
- deprecated
- legacy only
- should not be used
- pending removal
- unstable surface
- likely to be removed soon

### Compatibility Surface With Transition-Planning Note

#### Prefer
- currently supported for compatibility use
- remains available for existing callers
- preserved for compatibility while future planning is evaluated
- compatibility-supported surface with future transition-planning attention
- still supported, with future documentation posture under review

#### Avoid
- will be removed
- should be migrated immediately
- obsolete
- do not use
- slated for removal
- breaking change expected soon

### Global Guardrail

All wording should preserve confidence for current callers unless and until an approved PR introduces an actual behavior or support-policy change.
