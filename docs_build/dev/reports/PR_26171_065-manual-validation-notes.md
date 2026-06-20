# PR_26171_065 Manual Validation Notes

## Manual Review

- Confirmed active implementation path is `toolbox/messages/`.
- Confirmed no database files were changed.
- Confirmed Message Studio no longer exposes TTS profile creation/editing controls.
- Confirmed TTS profile dropdowns render from existing profile options with a default balanced fallback path in code.
- Confirmed `toolbox/messages/index.html` references Theme V2 and external scripts only.
- Confirmed no inline styles, style blocks, or inline event handlers are present.

## Browser Validation Coverage

- Opened Message Studio through the repo Playwright server.
- Added `Bat Encounter` as a parent message.
- Opened the child Message Parts table from the parent row.
- Added two ordered parts.
- Played the full message and verified two speech calls in part order.
- Played a single part and verified the speech call.
- Verified audio-engine-unavailable behavior shows visible actionable error text and does not create speech calls.

## Out Of Scope Manual Checks

- Did not exercise future TTS Studio profile authoring.
- Did not exercise external provider audio generation.
- Did not exercise database migration paths because this PR has no database changes.
