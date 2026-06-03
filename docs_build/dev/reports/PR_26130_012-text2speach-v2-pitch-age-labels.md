# PR_26130_012-text2speach-v2-pitch-age-labels

## Purpose

Add the requested `text2speach-V2` Pitch helper scale and lock Voice Age simulation behavior to visible Rate/Pitch slider updates without claiming true gender conversion.

## Scope

Changed only the `text2speach-V2` UI, existing speech defaults/schema hooks, targeted Workspace Manager V2 Playwright coverage, and required reports.

No `start_of_day` files were changed.

## Implementation Summary

- Added a centered helper scale directly under the Pitch slider:

```text
Male < Neutral > Female
```

- Kept the helper visual-only. It labels the pitch direction and does not claim true gender conversion.
- Renamed Voice Age option/value `elder` to `elderly` across defaults, schema, labels, and Playwright expectations.
- Kept Voice Age simulation behavior in the existing preset-derived slider path:
  - `child`: higher pitch, slightly faster rate
  - `teen`: slightly higher pitch, normal/slightly faster rate
  - `adult`: neutral pitch and rate
  - `elderly`: lower pitch, slower rate
- Preserved manual Rate and Pitch slider authority: once the user edits those sliders, later Voice Age changes do not overwrite those manual values.

## Playwright Impact

Playwright impacted: Yes.

Coverage added/updated for:

- Pitch helper scale text `Male < Neutral > Female`
- helper scale placement immediately below the Pitch slider
- helper scale centered alignment
- Voice Age enum/options using `elderly`
- Child, Teen, Adult, Elderly, and Any Voice Age slider updates
- existing manual Rate/Pitch override behavior after Voice Age changes

Expected pass behavior: the Pitch helper appears centered under the Pitch slider, Voice Age selections visibly update Rate/Pitch when sliders are not manually overridden, and manual Rate/Pitch edits remain authoritative.

Expected fail behavior: tests fail if the helper text is missing/misplaced/not centered, if `elderly` is not present in the schema/UI options, if Voice Age no longer updates sliders, or if manual Rate/Pitch edits are overwritten.

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
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('fs').readFileSync('tools/schemas/tools/text2speach-V2.schema.json','utf8')); console.log('schema json ok')"
rg -n -P "<script(?![^>]*\bsrc=)|<style|\son[a-zA-Z]+=" tools/text2speach-V2/index.html
git diff --check HEAD -- .
```

The inline HTML restriction scan returned no matches. `git diff --check` reported only the existing Windows line-ending warnings and no whitespace errors.

The workspace-v2 Playwright run also regenerated advisory V8 coverage reports:

- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

Changed runtime JavaScript coverage from the guardrail:

- `(98%) tools/text2speach-V2/js/controls/SpeechOptionsControl.js - executed lines 478/478; executed functions 46/47`
- `(100%) src/engine/audio/TextToSpeechDefaults.js - executed lines 162/162; executed functions 1/1`

## Full Samples Smoke Test

Skipped. The full samples smoke test is intentionally out of scope because this PR is limited to `text2speach-V2` Pitch helper labeling, Voice Age simulation labels/defaults, schema enum alignment, and targeted Workspace Manager V2 Playwright coverage.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_012-text2speach-v2-pitch-age-labels_delta.zip
```

## Manual Validation Steps

1. Open `tools/text2speach-V2/index.html`.
2. Confirm the Pitch slider shows the centered helper scale `Male < Neutral > Female` directly below the slider.
3. Select Voice Age `Child`, `Teen`, `Adult`, and `Elderly`; Rate and Pitch should update visibly when those sliders have not been manually edited.
4. Manually change Rate and Pitch, then select another Voice Age; the manual Rate and Pitch values should remain.
5. Confirm the UI does not describe the Pitch helper as true gender conversion.

Expected outcome: Pitch direction is visually explained, Voice Age simulation affects default Rate/Pitch only while allowed, and manual slider edits win.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/schemas/tools/text2speach-V2.schema.json`
- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `tools/text2speach-V2/styles/text2speach-V2.css`
- `docs_build/dev/reports/PR_26130_012-text2speach-v2-pitch-age-labels.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
