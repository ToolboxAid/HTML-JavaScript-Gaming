# No Mock Repository Runtime Source

Status: Approved
Owner: OWNER

## Required Product-Data Flow

```text
Browser → API → Database
```

Runtime product data must flow through the API/service contract backed by the database.

## Rules

- Mock repositories are 100% technical debt.
- "Mock repository ready" is not a valid Creator-testable completion state.
- Page arrays are not product-data sources of truth.
- JSON source files are not product-data sources of truth.
- `/tmp` files are not product-data sources of truth.
- Browser storage is not product-data source of truth.
- Runtime tool data must come from the API/service contract backed by the database.
- Seed data is allowed only if it seeds the database.
- Seed execution must be owned by server/API/setup flow.
- Browser pages must not seed authoritative records directly.

## Temporary Mock Repository Exception

If a temporary mock repository exists for transition, it must be documented as technical debt with:

- why it exists
- affected files
- removal PR
- replacement API/DB path
- Creator-testable limitation

Temporary mock repositories do not make a feature complete. They may only document a transition state.

## Game Configuration Example

"Game Configuration mock repository ready" does not count as complete.

Completion requires Game Configuration data to load through:

```text
Browser → API → Database
```

The Creator-testable completion state must prove that browser-visible Game Configuration data was read back through the API/service contract backed by the database.
