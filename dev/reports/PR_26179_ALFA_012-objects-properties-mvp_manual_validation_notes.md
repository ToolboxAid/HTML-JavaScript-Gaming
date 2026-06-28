# PR_26179_ALFA_012 Manual Validation Notes

## Manual Review Path
1. Open `toolbox/objects/index.html` with the API server running.
2. Add an object from the Objects table.
3. Select `Details` on the object row.
4. Confirm Object Details shows Name, Description, Type, Tags, Active, Visible, Sprite reference, Audio reference, and Default values.
5. Edit Description and confirm `Unsaved changes: yes` appears.
6. Press Cancel and confirm the field resets and dirty state clears.
7. Clear Name and press Save Details; confirm the friendly Name validation message appears.
8. Enter valid details and press Save Details.
9. Refresh the page; confirm saved details reload from the API-backed object record.

## Expected Owner Review Result
The panel is reviewable as a normal product form. It does not expose a behavior editor, Rules, Worlds, JSON editor, or engine internals.

## Known Out-of-Scope Items
- Behavior editor.
- Rules integration.
- Worlds integration.
- Database schema expansion.
- New API routes.
