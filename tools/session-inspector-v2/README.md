# Session Inspector V2

Session Inspector V2 is a first-class tool for inspecting and clearing current-origin browser storage during Workspace V2 and tool launch validation.

## Scope
- Reads `sessionStorage` and `localStorage` values for display.
- Deletes selected displayed storage entries or all currently shown entries on explicit user action.
- Does not pass data to other tools.
- Does not add repo selection or File System Access API behavior.

## Validation
- Open `tools/session-inspector-v2/index.html`.
- Seed a storage key in the current origin.
- Refresh the tool and verify the key appears in the Entries list.
- Select an entry and confirm the JSON panel shows the full stored value.
- Select a normalized workspace tool entry and confirm the Schema panel shows only its schema section.
- Use per-entry Delete or Delete All and verify the Entries list and status log update immediately.
