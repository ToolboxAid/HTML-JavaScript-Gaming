# PR_26171_069 Parent/Child Table Checklist

## Message Studio
- PASS: Parent table is `Messages`.
- PASS: Message row click expands the child `Message Parts` table directly under the parent row.
- PASS: Message Parts include Text, Emotion, and TTS Profile controls.
- PASS: Message Parts provide row-level Play Part and inline edit behavior.
- PASS: Message rows provide Play Message and inline edit behavior.
- PASS: Stop is available from Message Studio playback controls.
- PASS: Message-owned detached Emotion Profile and Available TTS Profile tables were removed.

## TTS Studio
- PASS: Parent table is `TTS Profiles`.
- PASS: TTS Profile row click expands the child `Emotion Settings` table.
- PASS: Emotion Settings belong to the selected TTS Profile.
- PASS: Default profile data includes Neutral, Happy, Angry, and Scared settings for the example profiles.
- PASS: No separate Emotion Studio was introduced.
