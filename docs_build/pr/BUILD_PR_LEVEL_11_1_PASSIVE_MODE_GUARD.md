# BUILD PR — Level 11.1 Passive Mode Guard

## Purpose
Prevent passive mode from mutating authoritative state.

## Scope
- Validation guard only
- No API changes

## File
- src/advanced/state/transitions.js

## Change
- Ensure authoritativeApply is NOT executed in passive mode

## Validation
- Passive mode produces no mutations
- Authoritative mode unchanged
