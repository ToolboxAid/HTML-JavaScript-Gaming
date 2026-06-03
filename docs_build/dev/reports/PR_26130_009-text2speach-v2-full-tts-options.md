# PR_26130_009-text2speach-v2-full-tts-options

## Purpose

Expand `text2speach-V2` from a baseline speech sample into a schema-backed, workspace-embeddable full TTS options tool while keeping the exact tool-facing name `text2speach-V2` and preserving `/src/engine/audio/` structure.

## Scope

Changed only Workspace Manager V2/text2speach-V2 lifecycle, queue, schema, defaults, UI, and Playwright coverage surfaces.

No `start_of_day` files were changed.

`docs_build/dev/codex_commands.md` and `docs_build/dev/commit_comment.txt` were updated locally as required and remain ignored so they cannot be committed.

## Implementation Summary

- Added full enum/default coverage in `src/engine/audio/TextToSpeechDefaults.js` for language, queue mode, repeat count, character preset, ssml-like preset, numeric ranges, required queue fields, and schema-complete default queue data.
- Expanded `TextToSpeechEngine` to use selected `SpeechSynthesis` voices and to support speak, pause, resume, stop, replace/append queue mode, repeat count, loop mode, and delay between repeats.
- Added SpeechSynthesis `voiceschanged` handling so browsers that load voices after page startup repopulate the Voice dropdown and re-enable Speak when a real voice becomes available.
- Rebuilt `text2speach-V2` UI controls around textarea text input, voice/language dropdowns, range sliders, queue mode, auto speak, repeat/delay, character preset, ssml-like preset, and direct/workspace action buttons.
- Added `tools/schemas/tools/text2speach-V2.schema.json`; every queue item requires all defined speech options.
- Registered the payload schema in `tools/schemas/workspace.manifest.schema.json`.
- Updated Workspace Manager V2 toolState hydration so selected-game text2speach-V2 launches receive schema-complete default queue data when the game manifest has no text2speach-V2 payload.
- Updated save/log item details to report `text2speach-V2 queue=3`.

## Tool Completion Status

Failing tool before: `text2speach-V2` did not expose the full TTS option set, did not have a workspace payload schema requiring all speech item options, and did not hydrate schema-complete queue data for Workspace Manager V2 launch/save flows.

Tool fixed: `text2speach-V2`.

Remaining failures after targeted validation: none found in `npm run test:workspace-v2`.

## Playwright Impact

Playwright impacted: Yes.

Coverage added/updated for:

- full option rendering
- schema-valid default queue
- required queue item option keys
- voice dropdown population from `speechSynthesis.getVoices()`
- voice dropdown recovery when `getVoices()` is empty at startup and `voiceschanged` fires later
- volume/rate/pitch/delay numeric sliders
- queue mode
- auto speak
- repeat count and delay
- character preset
- ssml-like preset
- speak/pause/resume/stop actions
- Workspace Manager V2 launch of text2speach-V2
- Workspace Manager V2 toolState hydration/save context containing schema-complete text2speach-V2 queue data

Expected pass behavior: text2speach-V2 renders all full TTS options, enables Speak only when text and a live voice are available, calls the expected SpeechSynthesis APIs, and persists schema-valid queue data through Workspace Manager V2 toolState context.

Expected fail behavior: tests fail if any required queue option is missing, controls are not populated from enum/default/runtime voice sources, numeric controls are not sliders, speech action buttons do not call the expected APIs, or Workspace Manager V2 omits the text2speach-V2 schema-complete queue payload.

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
node --check src/engine/audio/TextToSpeechEngine.js
node --check tools/text2speach-V2/js/TextToSpeechToolApp.js
node --check tools/text2speach-V2/js/bootstrap.js
node --check tools/text2speach-V2/js/controls/SpeechOptionsControl.js
node --check tools/text2speach-V2/js/controls/QueueControl.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('node:fs').readFileSync('tools/schemas/tools/text2speach-V2.schema.json','utf8'));"
node -e "JSON.parse(require('node:fs').readFileSync('tools/schemas/workspace.manifest.schema.json','utf8'));"
git diff --check
```

The workspace-v2 Playwright run also generated advisory V8 coverage reports:

- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## Full Samples Smoke Test

Skipped. The full samples smoke test is intentionally out of scope because this PR is limited to text2speach-V2 full TTS options/schema/toolState behavior and targeted Workspace Manager V2 coverage, not broad sample runtime behavior.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_009-text2speach-v2-full-tts-options_delta.zip
```

## Manual Validation Steps

1. Open `tools/text2speach-V2/index.html`.
2. Confirm the Speech Queue has named default sentences and the Speech Options section shows voice, language, volume, rate/speed, pitch, queue mode, auto speak, repeat count, delay, character preset, and ssml-like preset controls.
3. Select a voice, edit the text, and use Speak, Pause, Resume, and Stop.
4. Open Workspace Manager V2, pick a repo folder, select a game, launch `text2speach-V2`, and confirm Repo Destination is not shown and the workspace action buttons are available.
5. Return to Workspace Manager V2 and confirm the selected game/toolState remains active.

Expected outcome: all controls remain enabled according to voice/text availability, speech actions update the status log, and Workspace Manager V2 retains schema-complete text2speach-V2 queue data.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/schemas/tools/text2speach-V2.schema.json`
- `tools/schemas/workspace.manifest.schema.json`
- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/js/TextToSpeechToolApp.js`
- `tools/text2speach-V2/js/bootstrap.js`
- `tools/text2speach-V2/js/controls/ActionNavControl.js`
- `tools/text2speach-V2/js/controls/QueueControl.js`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `tools/text2speach-V2/styles/text2speach-V2.css`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `docs_build/dev/reports/PR_26130_009-text2speach-v2-full-tts-options.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
