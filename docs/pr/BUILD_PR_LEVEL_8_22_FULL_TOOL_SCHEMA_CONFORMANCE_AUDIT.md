Audit all tool payloads (samples + workspace manifests) against their declared tool schema.

Checks:
- $schema exists and matches tool
- tool field matches schema const
- version present and valid
- config matches schema structure (shape only, no deep validation logic)

No runtime changes.
No validators.
