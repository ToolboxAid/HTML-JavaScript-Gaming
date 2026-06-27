# PR 11.184 Decision Record

## Decision
Remove `vector-asset-studio -> svg-asset-studio`.

## Reason
A registry should not silently map one tool name to another. This hides incorrect callers and makes click/launch bugs harder to diagnose.

## Correct model
- `svg-asset-studio` is the only valid SVG Asset Studio id.
- `vector-asset-studio` is not a valid id unless a real tool with that id exists.
- Unknown ids fail explicitly.

## Follow-up
After this cleanup, continue fixing Workspace Manager click dispatch so SVG clicks launch `svg-asset-studio`.
