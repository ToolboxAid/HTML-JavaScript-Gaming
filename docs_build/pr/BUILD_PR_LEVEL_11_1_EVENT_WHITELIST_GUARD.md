# BUILD PR — Level 11.1 Event Whitelist Guard

## Purpose
Ensure only approved event types are emitted from transitions.

## Scope
- Validation guard only
- No API changes

## File
- src/advanced/state/transitions.js

## Change
- Enforce eventType must exist in WORLD_GAME_STATE_EVENT_TYPES

## Validation
- Unknown event types rejected
- Existing tests pass
