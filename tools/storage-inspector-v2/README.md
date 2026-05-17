# Storage Inspector V2

Storage Inspector V2 is a first-class tool for inspecting and clearing current-origin browser storage during Workspace V2 and tool launch validation.

## Scope
- Reads `sessionStorage` and `localStorage` values for display.
- Filters by storage type, key, and value text.
- Deletes a selected key from its owning storage on explicit user action.
- Clears session storage, local storage, Workspace Manager tool state keys, or all current-origin browser storage on explicit user action.
- Does not pass data to other tools.
- Does not add repo selection or File System Access API behavior.

## Validation
- Open `tools/storage-inspector-v2/index.html`.
- Seed a storage key in the current origin.
- Refresh the tool and verify the key appears in the Entries list.
- Select an entry and confirm the JSON panel shows the full stored value.
- Select a normalized workspace tool entry and confirm the Data panel shows only its data section.
- Select a normalized workspace tool entry and confirm the Dirty panel shows only its dirty-tracking section.
- Use per-entry Delete Key and the Clear Session, Clear Local, Clear Tool State, and Clear All controls; verify the Entries list and status log update immediately.
