# PR_26171_BETA_071-tts-profile-emotion-table

Generated: 2026-06-20T22:26:42.301Z
Team ownership: Bravo
Branch: pr/26171-BETA-071-tts-profile-emotion-table
Base HEAD: 78b642f70cf5698b611f2f8e1f6c6e18f9d73961
origin/main: 78b642f70cf5698b611f2f8e1f6c6e18f9d73961
Ahead/behind before commit: 0	0
Spec source: latest user request in Codex session; no repository BUILD_PR doc for PR_26171_BETA_071 was found by targeted search.

## Scope

- Implemented the missing TTS Studio parent/child table contract detail for Emotion Settings.
- Kept TTS Studio parent table as TTS Profiles.
- Kept profile row click expansion for selected-profile Emotion Settings.
- Kept inline Add/Edit Profile and Add/Edit Emotion behavior.
- Kept Message Studio TTS Profile dropdown compatibility.
- Kept Theme V2 and external JavaScript only.

## Code Changes

- Changed the TTS Studio Emotion Settings child-table column from `SSML-like Preset` to authoritative `Preset`.
- Updated the targeted TTS Playwright validation expectation to require the `Preset` child column.

## Existing Behavior Verified

- TTS Profiles columns remain: Profile Name, Voice, Language, Gender, Age, Emotion Count, Status, Actions.
- Emotion Settings child columns now read: Emotion, Pitch, Rate, Volume, Preset, Status, Actions.
- Default profile rows include Default Balanced Profile, Man Profile 1, and Woman Profile 2.
- Man Profile 1 and Woman Profile 2 each expose Neutral, Happy, Angry, and Scared emotion settings when selected.
- No separate Emotion Studio was introduced.
