# PR_26130_011-text2speach-v2-control-dependency-order

## Purpose

Lock `text2speach-V2` control order and dependency behavior without adding controls, renaming the tool, or restructuring `/src/engine/audio/`.

## Scope

Changed only the `text2speach-V2` UI/control wiring, speech option defaults, targeted Playwright coverage, and this PR's required reports.

No `start_of_day` files were changed.

## Implementation Summary

- Set the visible dependency order to:
  1. Gender
  2. Language
  3. Voice
  4. Voice Age
  5. Character Preset
  6. SSML-like Preset
  7. Text
  8. Queue Mode
  9. Auto Speak
  10. Repeat Count
  11. Delay Between Repeats
  12. Volume
  13. Rate / Speed
  14. Pitch
  15. Speak / Pause / Resume / Stop
- Moved Text into the ordered Speech Options flow.
- Moved Speak/Pause/Resume/Stop to the end of the ordered control flow.
- Aligned the `text2speach-V2` second header line with the other V2 tool header pattern: concise context in the eyebrow, operational detail in the meta line.
- Changed Gender to a helper filter with `Any`, `Male Preferred`, and `Female Preferred`.
- Included unknown and explicit neutral voices in both preferred Gender buckets so language coverage is not lost.
- Removed claims of true gender transformation from behavior/logging; Gender is logged as a helper filter only.
- Kept Language filtering scoped to the currently selected Gender helper bucket.
- Kept Voice as the final `speechSynthesis` voice selection.
- Kept Voice Age out of Language/Voice filtering; it shapes default pitch/rate only.
- Added SSML-like preset defaults so `normal`, `slow`, and `whisper-ish` visibly update pitch/rate/volume.
- Added manual slider override tracking so manual Volume, Rate, and Pitch changes stop later preset-derived auto-shaping from overwriting those sliders.
- Added filter count logging on Gender/Language changes: available languages, available voices, selected voice, and the helper-only Gender note.
- Preserved Queue Mode, Auto Speak, Repeat Count, Delay Between Repeats, and runtime Speak/Pause/Resume/Stop behavior.

## Tool Completion Status

Failing/unclear behavior before: control order did not match dependency order, Gender behaved like hard buckets, Voice Age was still entangled with voice filtering, SSML-like preset did not visibly update sliders, and manual slider override behavior was not explicitly protected.

Tool fixed: `text2speach-V2`.

Remaining failures after targeted validation: none found in `npm run test:workspace-v2`.

## Playwright Impact

Playwright impacted: Yes.

Coverage added/updated for:

- exact control ordering from Gender through Speak/Pause/Resume/Stop
- header eyebrow/meta copy matching the V2 tool header pattern
- Gender-to-Language filtering through preferred helper buckets
- unknown and explicit neutral voices remaining available under preferred Gender helper buckets
- Language-to-Voice filtering within the selected Gender helper bucket
- invalid Voice reset when a selected voice is no longer valid after Gender changes
- filter count logging on Gender/Language changes
- Character Preset slider updates
- SSML-like Preset slider updates
- manual Volume/Rate/Pitch slider override behavior after preset-derived values
- Voice Age shaping without filtering or clearing the selected Language/Voice
- Auto Speak and runtime queue action behavior already covered by the speech action path

Expected pass behavior: header copy follows the other V2 tools' eyebrow/meta pattern, controls appear in the requested order, Gender helper filters keep unknown/neutral voices available in preferred buckets, Language narrows Voice choices within the selected Gender helper, invalid selected voices are adjusted and logged, presets visibly update sliders, manual slider edits are preserved against later derived shaping, and runtime speech actions still target the current queue/options.

Expected fail behavior: tests fail if the header copy regresses, order regresses, Gender loses unknown/neutral voices, Language/Voice filtering breaks, invalid voice reset is silent, preset slider updates stop applying, manual slider edits are overwritten by later Voice Age shaping, Auto Speak no longer queues valid playback, or Speak/Pause/Resume/Stop stop operating on the runtime queue.

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
node --check tools/text2speach-V2/js/controls/SpeechOptionsControl.js
node --check tools/text2speach-V2/js/TextToSpeechToolApp.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('node:fs').readFileSync('tools/schemas/tools/text2speach-V2.schema.json','utf8'));"
rg -n -P "<script(?![^>]*\bsrc=)|<style|\son[a-zA-Z]+=" tools/text2speach-V2/index.html
git diff --check HEAD -- .
```

The workspace-v2 Playwright run also generated advisory V8 coverage reports:

- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## Full Samples Smoke Test

Skipped. The full samples smoke test is intentionally out of scope because this PR is limited to `text2speach-V2` control ordering, dependency behavior, helper filtering, and targeted Workspace Manager V2 Playwright coverage.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_011-text2speach-v2-control-dependency-order-header_delta.zip
```

## Manual Validation Steps

1. Open `tools/text2speach-V2/index.html`.
2. Confirm the visible control order matches the numbered dependency order in this report.
3. Confirm Gender options are `Any`, `Male Preferred`, and `Female Preferred`.
4. Select `Male Preferred` and confirm unknown voices remain available while explicitly female voices are omitted.
5. Select a Language and confirm Voice narrows to voices in that language.
6. Select a Voice, change Gender so it is no longer valid, and confirm the Voice selection is adjusted with a log line.
7. Select Character Preset values and confirm Volume, Rate, and Pitch update visibly.
8. Select SSML-like Preset values and confirm Volume, Rate, and Pitch update visibly.
9. Manually change Volume, Rate, and Pitch, then change Voice Age; manual slider values should remain.
10. Enable Auto Speak and edit valid Text; playback should queue automatically.
11. Use Speak, Pause, Resume, and Stop; each should log the runtime action.

Expected outcome: control order reads top-down by dependency, helper filtering is explicit and non-transformative, presets are visible but manual slider edits win, and speech actions operate on the current runtime queue.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/js/TextToSpeechToolApp.js`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `tools/text2speach-V2/styles/text2speach-V2.css`
- `docs_build/dev/reports/PR_26130_011-text2speach-v2-control-dependency-order.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
