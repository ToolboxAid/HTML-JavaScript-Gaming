# PR_26130_010-text2speach-v2-language-filtering

## Purpose

Make `text2speach-V2` match how browser SpeechSynthesis behaves: Language is selected first, and Voice only shows voices whose `SpeechSynthesisVoice.lang` matches that language.

## Scope

Changed only `text2speach-V2` language/voice UI, control filtering, schema/default ordering, and Workspace Manager V2 Playwright coverage.

No `start_of_day` files were changed.

`docs/dev/codex_commands.md` and `docs/dev/commit_comment.txt` were updated locally as required and remain ignored so they cannot be committed.

## Implementation Summary

- Moved Language above Voice in the Speech Options form.
- Moved `language` before `voice` in the text2speach-V2 required-field/default/schema order.
- Filtered Voice options to `speechSynthesis.getVoices()` entries whose `lang` matches the selected Language.
- Added visible voice match details under Voice, including match count and voice names.
- Auto-selects the first matching voice when a language change invalidates the previous selected voice.
- Clears Voice, disables Speak, and logs a visible failure when the selected Language has no matching voices.
- Preserved the existing queue payload shape and required queue item fields.

## Tool Completion Status

Failing behavior before: Language and Voice were independent, so selecting Language did not change audible voice behavior or the Voice dropdown contents.

Tool fixed: `text2speach-V2`.

Remaining failures after targeted validation: none found in `npm run test:workspace-v2`.

## Playwright Impact

Playwright impacted: Yes.

Coverage added/updated for:

- language-first control ordering
- dynamic Voice filtering by selected Language
- auto-selection of the first matching voice when the prior Voice becomes invalid
- invalid voice reset behavior when a language has no matching voices
- visible Voice match counts/details
- delayed `voiceschanged` population respecting the selected Language filter
- existing full TTS options, schema-valid default queue, speech actions, and Workspace Manager V2 launch behavior

Expected pass behavior: Language controls the Voice list, Voice never shows non-matching voices, selection adjustments are logged, and Speak is disabled when no matching voice exists.

Expected fail behavior: tests fail if Language is not first, non-matching voices appear, an invalid selected Voice remains active, Voice match details are missing, or delayed voice population ignores the language filter.

## Validation

Passed:

```text
npm run test:workspace-v2
```

Result:

```text
26 passed
```

Additional checks:

```text
node --check src/engine/audio/TextToSpeechDefaults.js
node --check tools/text2speach-V2/js/controls/SpeechOptionsControl.js
node --check tools/text2speach-V2/js/TextToSpeechToolApp.js
node --check tools/text2speach-V2/js/bootstrap.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('node:fs').readFileSync('tools/schemas/tools/text2speach-V2.schema.json','utf8'));"
git diff --check
```

The workspace-v2 Playwright run also generated advisory V8 coverage reports:

- `docs/dev/reports/playwright_v8_coverage_report.txt`
- `docs/dev/reports/coverage_changed_js_guardrail.txt`

## Full Samples Smoke Test

Skipped. The full samples smoke test is intentionally out of scope because this PR is limited to text2speach-V2 language/voice filtering behavior and targeted Workspace Manager V2 coverage, not broad sample runtime behavior.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_010-text2speach-v2-language-filtering_delta.zip
```

## Manual Validation Steps

1. Open `tools/text2speach-V2/index.html`.
2. Confirm Language appears above Voice in Speech Options.
3. Confirm the default `en-US` language shows only matching `en-US` voices and the visible Voice details line reports match count/name details.
4. Change Language to `en-GB`; Voice should auto-select the first matching `en-GB` voice and the status log should report the adjustment.
5. Change Language to a locale with no available voices; Voice should clear, Speak should disable, and the status log should explain that no matching voice exists.
6. Change back to a language with matching voices and confirm Speak becomes available again.

Expected outcome: Voice options are always language-filtered, selection changes are visible/logged, and no non-matching or hidden fallback voice is used.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/schemas/tools/text2speach-V2.schema.json`
- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/js/TextToSpeechToolApp.js`
- `tools/text2speach-V2/js/bootstrap.js`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `tools/text2speach-V2/styles/text2speach-V2.css`
- `docs/dev/reports/PR_26130_010-text2speach-v2-language-filtering.md`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/reports/playwright_v8_coverage_report.txt`
- `docs/dev/reports/coverage_changed_js_guardrail.txt`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
