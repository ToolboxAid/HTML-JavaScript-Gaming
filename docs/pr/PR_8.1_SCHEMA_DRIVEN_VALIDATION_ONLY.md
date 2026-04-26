# PR 8.1 — Schema-Driven Validation Only

## Summary
- Enforces schema-only validation
- Removes all fallback logic
- Establishes schema ownership boundaries

## Rules
- workspace.manifest = source of truth
- tools define their own schema
- shared schemas live only in tools/schemas/
- samples consume schemas only
- NO fallback logic allowed
