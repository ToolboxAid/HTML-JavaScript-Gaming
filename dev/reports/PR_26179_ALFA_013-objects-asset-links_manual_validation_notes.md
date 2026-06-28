# PR_26179_ALFA_013 Manual Validation Notes

## Manual Review Path
1. Open `toolbox/objects/index.html` with the API server running.
2. Add an object with Sprite render enabled.
3. Select `Details` on the object row.
4. Confirm Object Details includes Sprite reference, Audio reference, and Message reference.
5. Confirm the Asset Links panel shows the selected object's sprite, audio, and message statuses.
6. Enter a missing audio or message reference and press Save Details.
7. Confirm friendly validation appears without exposing API/database internals.
8. Enter an existing message reference and save.
9. Refresh the page; confirm the message reference reloads and the Asset Links panel resolves it.

## Expected Owner Review Result
The Objects inspector is reviewable as a product surface for asset and message references. It keeps object details, reference links, and missing-reference guidance in one place without exposing a behavior editor, Rules integration, Worlds integration, JSON editor, or engine internals.

## Known Out-of-Scope Items
- Creating new audio assets from Objects.
- Creating new messages from Objects.
- Behavior editor.
- Rules integration.
- Worlds integration.
- Database schema expansion.
- New API routes.
