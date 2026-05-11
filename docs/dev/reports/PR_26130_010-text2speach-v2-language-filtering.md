# PR_26130_010-text2speach-v2-language-filtering

## Purpose

Make `text2speach-V2` follow the intended speech setup stack:

```text
Gender -> Language -> Voice -> Voice Age -> Character preset -> SSML-like preset -> editable tuning controls
```

Gender filters available Languages, Language filters Voice, Voice Age shapes pitch/rate, Character applies editable performance defaults, and SSML-like remains a separate delivery treatment.

The duplicate Announcer/Announcement concept was removed: `announcer` was a Character preset and `announcement` was an SSML-like preset, which made the two dropdowns feel like they were doing the same job. Character now owns persona/performance choices, while SSML-like owns text treatment.

## Scope

Changed only `text2speach-V2` option ordering, dropdown sorting, Gender/Language/Voice filtering, Voice Age shaping, voice metadata classification, Character preset defaults, the text2speach-V2 schema enum, the shared text-to-speech engine voice option metadata, and Workspace Manager V2 Playwright coverage.

No `start_of_day` files were changed.

`docs/dev/codex_commands.md` and `docs/dev/commit_comment.txt` were updated locally as required and remain ignored so they cannot be committed.

## Implementation Summary

- Stacked Speech Options in the requested order: Gender, Language, Voice, Voice Age, Character preset, SSML-like preset.
- Added Voice Age dropdown with `Any`, `Adult`, `Child`, `Elder`, and `Teen`; `Any` is pinned first.
- Voice Age no longer filters Language or Voice; it shapes pitch/rate before Character preset tuning.
- Added shared voice option age metadata from the SpeechSynthesis voice model when present.
- Added `voiceAge` to default queue data and the workspace-embeddable speech queue schema.
- Added Voice Age shaping defaults that adjust pitch/rate for `Child`, `Teen`, `Adult`, and `Elder` while leaving `Any` neutral.
- Rebuilds Language from voices matching the selected Gender.
- Rebuilds Voice from voices matching the selected Gender and Language.
- Shows explicit no-language/no-voice empty states when a selected Gender has no matching voices.
- Sorted dropdown choices alphabetically while pinning requested defaults at the top: `Any`, `All`, `Manual`, and `Normal`.
- Sorted runtime Language and Voice dropdowns by visible labels after SpeechSynthesis voices load.
- Preserved Gender with `All`, `Male`, `Female`, and `Neutral`; it remains runtime-only because SpeechSynthesis has no standard gender utterance field.
- Classifies explicit Neutral voices only when voice metadata/name says neutral, non-binary, or androgynous.
- From the current browser voice list supplied by the user, there are no truly Neutral voices; generic Google voices are not treated as Neutral.
- Classifies explicit male voices next, treats the `es-ES` Spanish Spain browser voice as Male, then treats female/known Google browser voices as Female.
- Leaves unknown-gender voices out of Gender-specific buckets instead of treating unknown as Neutral.
- Character presets now contain `manual`, `alert`, `calm`, `dramatic`, `narrator`, and `robot`.
- SSML-like presets now contain `normal`, `slow`, and `whisper-ish`.
- Character presets apply editable defaults:
  - `manual`: neutral baseline
  - `alert`: faster attention-getting baseline
  - `calm`: slower steady baseline
  - `dramatic`: brighter performance baseline
  - `narrator`: neutral narration baseline
  - `robot`: flatter, lower synthetic baseline
- User slider/SSML changes after selecting a Character preset are preserved as manual tuning.
- Preserved existing queue payload shape and required queue item fields.

## Tool Completion Status

Failing/unclear behavior before: Character and SSML-like both had announcement-style choices, there was no Voice Age filter, and age-specific voice selection could not be represented in the UI.

Tool fixed: `text2speach-V2`.

Remaining failures after targeted validation: none found in `npm run test:workspace-v2`.

## Playwright Impact

Playwright impacted: Yes.

Coverage added/updated for:

- ordered controls: Gender, Language, Voice, Voice Age, Character preset, SSML-like preset
- Voice Age options with `Any` pinned first
- Voice Age pitch/rate shaping for Child and reset back to Any
- Voice Age does not filter or clear selected Language/Voice
- schema-required `voiceAge` on every speech queue item
- sorted dropdown order with `Any`, `All`, `Manual`, and `Normal` pinned first
- alphabetic runtime Language and Voice options
- Character preset options: `manual`, `alert`, `calm`, `dramatic`, `narrator`, `robot`
- SSML-like preset options: `normal`, `slow`, `whisper-ish`
- schema enum matching the Character and SSML-like option split
- Gender-filtered Language and Voice behavior
- corrected voice gender buckets: explicit Neutral metadata appears under Neutral, unknown voices do not appear under Neutral, explicit male voices remain Male, `es-ES` appears under Male, Google browser voices without male markers move to Female, `es-US` remains Female, and empty Neutral disables Speak
- Character preset default application to rate, pitch, volume, and SSML
- Manual preset reset to neutral defaults
- user adjustment after preset application
- existing speech queue, speech actions, delayed voice loading, and Workspace Manager V2 launch behavior

Expected pass behavior: the top controls appear in the requested order, dropdowns are sorted with `Any`, `All`, `Manual`, and `Normal` pinned first, Gender filters Language, Language filters Voice, Voice Age adjusts pitch/rate without clearing Language/Voice, `es-ES` is Male, `es-US` remains Female, explicit Neutral metadata appears under Neutral, unknown voices are not mislabeled as Neutral, Character applies editable defaults, user tuning after a preset is reflected in the summary/speak action, and Character no longer duplicates SSML-like announcement treatment.

Expected fail behavior: tests fail if the order regresses, Voice Age disappears, age shaping stops changing pitch/rate, Voice Age clears or filters Language/Voice, dropdown sorting breaks, explicit Neutral metadata does not populate Neutral, unknown voices are mislabeled as Neutral, `es-ES` is missing from Male, `es-US` moves out of Female unexpectedly, Male/Female filtering breaks, Manual is missing, Character no longer applies defaults, user edits are overwritten unexpectedly, or voice filtering breaks.

## Validation

Passed:

```text
npm run test:workspace-v2
```

Result:

```text
28 passed
```

Additional checks passed:

```text
node --check src/engine/audio/TextToSpeechDefaults.js
node --check src/engine/audio/TextToSpeechEngine.js
node --check tools/text2speach-V2/js/controls/SpeechOptionsControl.js
node --check tools/text2speach-V2/js/TextToSpeechToolApp.js
node --check tools/text2speach-V2/js/bootstrap.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('node:fs').readFileSync('tools/schemas/tools/text2speach-V2.schema.json','utf8'));"
rg -n -P "<script(?![^>]*\bsrc=)|<style|\son[a-zA-Z]+=" tools/text2speach-V2/index.html
git diff --check HEAD -- .
```

The workspace-v2 Playwright run also generated advisory V8 coverage reports:

- `docs/dev/reports/playwright_v8_coverage_report.txt`
- `docs/dev/reports/coverage_changed_js_guardrail.txt`

## Full Samples Smoke Test

Skipped. The full samples smoke test is intentionally out of scope because this change is limited to text2speach-V2 Gender/Language/Voice filtering, Voice Age shaping, preset behavior, and targeted Workspace Manager V2 coverage, not broad sample runtime behavior.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_010-text2speach-v2-age-before-character_delta.zip
```

## Manual Validation Steps

1. Open `tools/text2speach-V2/index.html`.
2. Confirm Speech Options are stacked as Gender, Language, Voice, Voice Age, Character preset, SSML-like preset.
3. Confirm Voice Age shows `Any` first, then the remaining values alphabetically.
4. Confirm Gender shows `All` first, then the remaining values alphabetically.
5. Confirm Character preset shows `Manual` first, then `Alert`, `Calm`, `Dramatic`, `Narrator`, and `Robot`.
6. Confirm SSML-like preset shows `Normal` first, then `Slow` and `Whisper-ish`.
7. Confirm Queue mode, Language, and Voice options are alphabetic by visible label.
8. Select `Child` Voice Age and confirm pitch/rate change while Language, Voice, and Speak remain available.
9. Select `Any` Voice Age to restore neutral pitch/rate for the current Character preset.
10. Select `Male` and confirm Language includes `es-ES` plus languages with explicit male voices.
11. Select `es-ES` and confirm the Voice dropdown shows `Google espanol`.
12. Select `Female` and confirm `es-US` remains available while `es-ES` is not listed.
13. Select `Neutral`; with the current available voice list, it should show no Neutral voice languages, no Neutral voices, and disabled Speak.
14. In the mocked explicit-neutral Playwright path, confirm Neutral shows only the voice whose metadata is `gender: "neutral"`.
15. In the mocked explicit-age Playwright path, confirm Child shows only the voice whose metadata is `age: "child"`.
16. Select Language and confirm Voice narrows to matching voices.
17. Select `Calm`, `Dramatic`, `Alert`, and `Robot`; Rate, Pitch, Volume, and SSML should change to each preset's defaults.
18. Select `Manual`; Rate, Pitch, Volume, and SSML should return to neutral defaults.
19. Select a Character preset, then adjust sliders/SSML manually and confirm the summary reflects the manual adjustments.

Expected outcome: the setup flow reads top-down, Character is a persona/performance preset, SSML-like is a separate delivery treatment, Gender filtering is explicit, Voice Age changes pitch/rate without changing selected voice, no pasted browser voice is mislabeled Neutral, and the user remains free to tune after selecting a preset.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/schemas/tools/text2speach-V2.schema.json`
- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/js/TextToSpeechToolApp.js`
- `tools/text2speach-V2/js/bootstrap.js`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `docs/dev/reports/PR_26130_010-text2speach-v2-language-filtering.md`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
