# LEVEL_11_1_CONTRACT_TESTS_AND_ROLLBACK_GATES

## Contract Tests
Codex should add focused tests that validate:

1. Authoritative updates occur only through the named transition
2. Public selectors remain read-only and side-effect free
3. Unapproved event payloads are rejected or ignored safely
4. Passive mode and feature gate off-state preserve prior behavior
5. Integration registration does not alter engine core APIs
6. Consumer reads authoritative slice without mutating it

## Rollout Gates
- Feature gate defaults to off unless explicitly enabled for validation
- Passive mode behavior remains available for comparison
- No failures in existing Level 10.x validation paths
- No imports introduced from engine into advanced state logic
- No additional consumers beyond the single approved path

## Rollback Triggers
Roll back immediately if:
- existing behavior changes with gate off
- event contract drift appears
- selectors gain mutation or hidden caching side effects
- engine boundary violations appear
- objective flow requires more than one authoritative slice to function

## Rollback Method
- Disable feature gate
- Restore passive mirror behavior as default
- Preserve tests and docs for follow-up refinement
