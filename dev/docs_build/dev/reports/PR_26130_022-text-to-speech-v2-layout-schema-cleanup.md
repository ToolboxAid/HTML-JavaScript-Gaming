# PR_26130_022-text-to-speech-v2-layout-schema-cleanup

## Summary

- Moved Text to Speech V2 Speak, Pause, Resume, and Stop controls to the bottom of the Text to Speak accordion.
- Bottom-aligned the Text to Speak content area and removed the bottom/right resize affordance from `text2speach-V2SpeechText`.
- Removed `text2speach-V2` payloads from the Asteroids, Gravity Well, and Pong game manifests.
- Removed stale-object payload constants/helpers and the extra queue validator from Text to Speech V2 so payload pass/fail goes through schema validation only.
- Kept sample 1903 Text to Speech V2 JSON in place and validated as the standalone/sample source.

## Implementation Notes

- `toolbox/text2speach-V2/index.html` now places `text2speach-V2SpeechActions` inside `text2speach-V2TextContent` after the textarea.
- `toolbox/text2speach-V2/styles/text2speach-V2.css` pins the Text accordion content to a bottom-aligned column layout and sets `resize: none` on Text to Speech V2 textareas.
- `toolbox/text2speach-V2/js/TextToSpeechToolApp.js` now relies on `toolbox/schemas/tools/text2speach-V2.schema.json` as the validation gate for load, import, copy, and export paths.
- Workspace Manager V2 tests now expect Text to Speech V2 to be disabled for the three current game manifests because those manifests no longer declare a Text to Speech payload.

## Validation

- Passed: `npm run test:workspace-v2`
  - Result: 33 passed.
- Passed: focused Playwright cleanup group covering Text to Speech layout, schema rejection, disabled manifest payload state, and Gravity Well/Pong manifest cleanup.
- Passed: JavaScript syntax checks for changed Text to Speech V2 and Workspace Manager V2 Playwright files.
- Passed: JSON parse check confirming Asteroids, Gravity Well, and Pong no longer contain `text2speach-V2`, while sample 1903 remains a root array with 3 items.
- Passed: `git diff --check`
  - Note: Git printed line-ending normalization warnings for existing Windows-touched files, but no whitespace errors were reported.

## Playwright Coverage

- Verifies speech runtime buttons are at the bottom of the Text to Speak accordion.
- Verifies Text to Speak content bottom alignment and textarea `resize: none`.
- Verifies stale old object payloads are rejected through schema validation, not stale-field special-casing.
- Verifies stale constants/helpers are absent from the Text to Speech V2 app source.
- Verifies Asteroids, Gravity Well, and Pong manifests/configs no longer expose `text2speach-V2`.
- Verifies sample 1903 Text to Speech V2 JSON still loads and renders as the validated root array payload.

## Skipped

- Full samples smoke test was not run. The BUILD request explicitly said not to run it; this PR is scoped to Text to Speech V2 layout/schema cleanup and three game manifest references, with focused Workspace V2 coverage.

## Scope Guard

- No `start_of_day` files changed.
- No unrelated schemas were changed.
- No unrelated tools were changed.
- Sample 1903 Text to Speech V2 JSON was not removed.
