# PR_26171_BETA_069-message-tts-profile-contract-alignment Parent/Child Table Checklist

Generated: 2026-06-20T22:03:35.223Z

## TEAM Ownership

- TEAM owner: BETA

## Message Studio

| Requirement | Result | Evidence |
| --- | --- | --- |
| Parent table is Messages | PASS | Messages table remains the primary center-panel table |
| Clicking Message row opens Message Parts child table | PASS | MessagesTool.spec.mjs opens a row and verifies Message Parts |
| Child table has Text | PASS | Test verifies data-segment-text in the add/edit row |
| Child table has Emotion | PASS | Test verifies data-segment-emotion in the add/edit row |
| Child table has TTS Profile | PASS | Test verifies data-segment-tts-profile in the add/edit row |
| Default balanced TTS Profile is available | PASS | Local API seed and fallback profile use Default Balanced TTS Profile |

## TTS Studio

| Requirement | Result | Evidence |
| --- | --- | --- |
| Parent table is TTS Profiles | PASS | TextToSpeechFunctional.spec.mjs verifies TTS Profiles table |
| Clicking profile opens Emotion Settings child table | PASS | TextToSpeechFunctional.spec.mjs opens Default, Man, and Woman profiles |
| Emotion Settings belong to selected profile | PASS | Emotion rows are rendered under selected profile and edited through profile-specific controls |
| Man Profile 1 has Neutral, Happy, Angry, Scared | PASS | TextToSpeechFunctional.spec.mjs |
| Woman Profile 2 has Neutral, Happy, Angry, Scared | PASS | TextToSpeechFunctional.spec.mjs |
