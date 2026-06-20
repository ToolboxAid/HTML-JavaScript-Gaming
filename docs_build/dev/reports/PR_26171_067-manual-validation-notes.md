# PR_26171_067 Manual Validation Notes

## Notes

- Verified TTS Studio keeps the active path `toolbox/text-to-speech/`.
- Verified the page uses Theme V2 classes and external JavaScript only.
- Verified the profile table can open child Emotion Settings by clicking the profile row.
- Verified `Default Balanced Profile` delete is disabled because it is marked in use by Message Studio data.
- Verified default `Neutral` emotion delete is disabled because it is marked in use by Message Parts.
- Verified Add Profile, Edit Profile, Add Emotion, and Edit Emotion inline rows through targeted Playwright validation.
- Verified Message Studio remains separate and its existing TTS dropdown smoke path still passes.
- Verified no `tools/text2speech/` path was created.
- Verified no database files were changed.

## Follow Up

- Future persistence can connect TTS Studio profile authoring to the existing Local API profile contract once that API ownership is assigned.
