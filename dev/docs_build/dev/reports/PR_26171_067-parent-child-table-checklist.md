# PR_26171_067 Parent Child Table Checklist

## Parent Table

- PASS: Parent table label is `TTS Profiles`.
- PASS: Parent table lives in `toolbox/text-to-speech/`.
- PASS: Parent table columns are Profile Name, Voice, Language, Gender, Age, Emotion Count, Status, Actions.
- PASS: Default rows include `Default Balanced Profile`, `Man Profile 1`, and `Woman Profile 2`.
- PASS: Parent row click opens or closes the child Emotion Settings row.
- PASS: One selected profile row owns the visible child subtable at a time.
- PASS: Parent profile count is visible in the summary stats.

## Parent Actions

- PASS: Add Profile opens a new inline row below the parent table rows.
- PASS: Edit Profile opens an inline edit row for the selected profile.
- PASS: Save Profile validates required Profile Name and Language values.
- PASS: Duplicate Profile Name is blocked with a visible actionable error.
- PASS: Cancel Profile closes the inline editor without applying changes.
- PASS: Delete Profile removes unused profiles.
- PASS: Delete Profile is disabled when the profile has Message Studio usage.

## Child Table

- PASS: Child table label is `Emotion Settings`.
- PASS: Child table opens under the selected TTS Profile row.
- PASS: Child columns are Emotion, Pitch, Rate, Volume, SSML-like Preset, Status, Actions.
- PASS: Default neutral emotion is provided for every default profile.
- PASS: Emotion count is visible in both the profile row and summary stats.

## Child Actions

- PASS: Add Emotion opens a new inline row in the child table.
- PASS: Edit Emotion opens an inline edit row.
- PASS: Save Emotion validates selected profile and unique emotion per profile.
- PASS: Cancel Emotion closes the inline editor without applying changes.
- PASS: Delete Emotion removes unused emotions.
- PASS: Delete Emotion is disabled when the emotion has Message Parts usage.
