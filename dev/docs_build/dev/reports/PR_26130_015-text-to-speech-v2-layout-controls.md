# PR_26130_015-text-to-speech-v2-layout-controls

## Purpose

Polish Text to Speech V2 layout controls, queue item actions, and speech option constraints while keeping the internal tool id `text2speach-V2`.

## Scope

Changed Text to Speech V2 runtime, schema/defaults, related shared audio TTS defaults/engine clamp behavior, and Workspace Manager V2 Playwright coverage for this tool only.

No unrelated files were modified. No `start_of_day` files were changed.

## Implementation Summary

- Set Pitch minimum to `0.1` in defaults, schema, and utterance clamp behavior.
- Restored neutral/unknown voices to helper filtering buckets so preferred gender filters do not hide available language coverage.
- Replaced the Text to Speech V2 header frame pattern with the same local common header layout pattern used by Palette Manager V2, while keeping the visible title `Text to Speech V2`.
- Moved Text into the center column as its own accordion, removed the center speech preview div, and renamed the preview area to `Named Sentences`.
- Replaced the named sentence dropdown with selectable tiles and moved Speak/Pause/Resume/Stop controls to the top of the Named Sentences accordion.
- Changed the status action order to X then Clear.
- Added the exact visible character preset label `D&D Dungeon Master`.
- Added Speech Options Add, Duplicate, and Delete buttons.
- Wired Add/Duplicate/Delete to maintain a complete schema-valid queue, preserve a selected item, and mark workspace toolState dirty for item and option changes.

## Playwright Impact

Playwright impacted: Yes.

The Workspace Manager V2 Playwright suite validates:

- Text to Speech V2 visible naming and header layout contract.
- Pitch minimum `0.1` in UI and schema.
- Neutral/unknown voices restored in preferred gender helper buckets.
- Text accordion placement in the center column.
- Named Sentences tiles replacing the old dropdown.
- Speak/Pause/Resume/Stop at the top of Named Sentences.
- Status action order as X then Clear.
- `D&D Dungeon Master` preset presence and slider effects.
- Add/Duplicate/Delete item behavior and dirty toolState persistence.

Expected pass behavior: controls render in the requested order/layout, speech items hydrate and mutate schema-valid queue data, and dirty state is updated after queue/text/options changes.

Expected fail behavior: Playwright fails if the legacy dropdown/header/preview patterns return, if queue item mutations leave invalid state, or if requested controls are missing or misordered.

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
node --check toolbox/text2speach-V2/js/TextToSpeechToolApp.js
node --check toolbox/text2speach-V2/js/bootstrap.js
node --check toolbox/text2speach-V2/js/controls/QueueControl.js
node --check toolbox/text2speach-V2/js/controls/OutputSummaryControl.js
node --check toolbox/text2speach-V2/js/controls/SpeechOptionsControl.js
node --check toolbox/text2speach-V2/js/controls/TextInputControl.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('node:fs').readFileSync('toolbox/schemas/tools/text2speach-V2.schema.json','utf8')); console.log('schema ok')"
git diff --check HEAD -- .
rg -n -P "<script(?![^>]*\bsrc=)|<style|\son[a-zA-Z]+=" toolbox/text2speach-V2/index.html
rg -n "toolbox/shared|imageDataUrl|start_of_day" src/engine/audio toolbox/text2speach-V2 toolbox/schemas/tools/text2speach-V2.schema.json tests/playwright/tools/WorkspaceManagerV2.spec.mjs
```

The inline HTML restriction scan and forbidden-scope scan returned no matches. `git diff --check` reported only existing Windows line-ending warnings and no whitespace errors.

## V8 Coverage

The `npm run test:workspace-v2` run generated the Playwright V8 coverage report at:

```text
docs_build/dev/reports/playwright_v8_coverage_report.txt
```

Changed runtime JS coverage included:

- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `toolbox/text2speach-V2/js/TextToSpeechToolApp.js`
- `toolbox/text2speach-V2/js/bootstrap.js`
- `toolbox/text2speach-V2/js/controls/OutputSummaryControl.js`
- `toolbox/text2speach-V2/js/controls/QueueControl.js`
- `toolbox/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `toolbox/text2speach-V2/js/controls/TextInputControl.js`

The coverage guard reported no low-coverage changed runtime JS files.

## Full Samples Smoke Test

Skipped. This PR is limited to Text to Speech V2 layout, schema/defaults, runtime queue controls, and Workspace Manager V2 tool launch coverage. It does not modify the shared sample loader, sample JSON, or broad game launch behavior.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_015-text-to-speech-v2-layout-controls_delta.zip
```

## Manual Validation Steps

1. Open `toolbox/text2speach-V2/index.html`.
2. Confirm the header matches the Palette Manager V2-style common header layout and the visible title is `Text to Speech V2`.
3. Confirm the center column shows Text above Named Sentences, with no speech preview div.
4. Confirm Named Sentences uses selectable tiles and has Speak, Pause, Resume, and Stop at the top.
5. Confirm Speech Options shows Add, Duplicate, and Delete at the bottom.
6. Select a named sentence tile and confirm Speech Options and Text hydrate from that item.
7. Use Add, Duplicate, and Delete and confirm the queue never becomes empty or invalid.
8. Change text/options and confirm Workspace Manager V2 marks the Text to Speech V2 toolState dirty when launched from the workspace.

Expected outcome: the requested Text to Speech V2 layout and controls are present, queue item actions preserve valid toolState data, and dirty state changes after edits.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `toolbox/schemas/tools/text2speach-V2.schema.json`
- `toolbox/text2speach-V2/index.html`
- `toolbox/text2speach-V2/js/TextToSpeechToolApp.js`
- `toolbox/text2speach-V2/js/bootstrap.js`
- `toolbox/text2speach-V2/js/controls/OutputSummaryControl.js`
- `toolbox/text2speach-V2/js/controls/QueueControl.js`
- `toolbox/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `toolbox/text2speach-V2/js/controls/TextInputControl.js`
- `toolbox/text2speach-V2/styles/text2speach-V2.css`
- `docs_build/dev/reports/PR_26130_015-text-to-speech-v2-layout-controls.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
