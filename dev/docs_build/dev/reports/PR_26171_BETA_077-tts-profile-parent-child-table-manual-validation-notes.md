# PR_26171_BETA_077 Manual Validation Notes

## Review
- Confirmed the TTS Profiles table keeps profile fields in the parent row.
- Confirmed Emotion Settings open below the selected profile as a child table.
- Confirmed Add Profile and Add Emotion controls render as table rows.
- Confirmed non-name parent table cells do not open Emotion Settings.
- Confirmed no separate Emotion Studio or duplicate left-column controls were introduced.

## Manual Browser Coverage
- Covered by targeted Playwright validation for TTS Studio load, profile expansion, child emotion rows, inline add/edit, and speech preview.
