# BUILD PR — Level 11.1 Authoritative Apply Guard

## Purpose
Ensure authoritativeApply executes only when explicitly allowed.

## Scope
- Guard only
- No API changes

## File
- src/advanced/state/transitions.js

## Change
- Only invoke authoritativeApply when context.authoritative === true

## Validation
- Passive execution does not call authoritativeApply
- Authoritative execution unchanged
