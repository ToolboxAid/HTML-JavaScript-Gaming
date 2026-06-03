# APPLY PR — Games Breakout Full Folder Migration

## Purpose
Accept the completed full-folder migration of Breakout using the template-based pipeline.

## Accepted State
- `games/Breakout/**` is canonical and running
- `games/Breakout_next/**` has been removed
- structure aligns with template contract
- gameplay successfully migrated and wired

## Acceptance Criteria (Met)
- Breakout runs from canonical path
- canvas rendering active
- no console errors
- correct folder structure
- no unrelated changes

## Non-Goals
- no additional refactors
- no template changes
- no engine/shared modifications

## Result
Breakout migration completed end-to-end using single BUILD pipeline.
