# Session Inspector

Session Inspector is a read-only first-class tool for inspecting current-origin browser storage during Workspace V2 and tool launch validation.

## Scope
- Reads `sessionStorage` and `localStorage` values for display only.
- Does not write storage values.
- Does not pass data to other tools.
- Does not add repo selection or File System Access API behavior.

## Validation
- Open `tools/session-inspector/index.html`.
- Seed a storage key in the current origin.
- Refresh the tool and verify the key appears in the Entries list.
- Select an entry and confirm the Details panel shows raw value, parsed value, parse status, and byte size.
