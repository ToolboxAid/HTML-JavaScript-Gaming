# PR_26130_016-text-to-speech-v2-named-speech-selection

## Purpose

Update Text to Speech V2 named speech selection so speech items can be started independently, repeat controls are removed, and item naming is editable and schema-valid.

## Scope

Changed only Text to Speech V2 runtime/UI/schema/defaults, the shared Text to Speech engine/default modules, and Workspace Manager V2 Playwright coverage for this tool.

No unrelated files were modified. No `start_of_day` files were changed.

## Implementation Summary

- Removed Repeat Count and Delay Between Repeats from UI, schema, defaults, item data, hydration, and tests.
- Added safe migration for older queue items that still contain `repeatCount` or `delayBetweenRepeatsMs`; the fields are stripped before render and workspace launch data is marked dirty for migration.
- Changed visible text labels from `Text` / `Speech text` to `Text to Speak`.
- Added a Name input above Add/Duplicate/Delete.
- Blocked Add when Name is empty with a visible status message.
- Populated Name from the selected tile and wired Name edits to update the selected item name, tile label, summary, and dirty toolState.
- Changed speech start behavior so starting another named speech item does not call global `speechSynthesis.cancel()`.
- Added active speaker tracking by selected speech item id/name.
- Added selected Stop handling that uses global cancel only when it will not stop other tracked speakers.
- Added Stop All as the explicit global-cancel action for multiple active speakers.
- Updated the `D&D Dungeon Master` preset to `ssmlLikePreset=normal`, `volume=1`, `rate=0.8`, and `pitch=0.5`.

## Playwright Impact

Playwright impacted: Yes.

The Workspace Manager V2 Playwright suite validates:

- Multiple named speech items can be started without canceling prior speakers.
- Starting a new named speech item does not call global `speechSynthesis.cancel()`.
- Stop refuses selected-speaker global cancel while multiple speakers are active, and Stop All is explicit.
- Repeat Count and Delay Between Repeats controls are removed.
- Schema/default queue items no longer require repeat or delay fields.
- `Text to Speak` label appears and `Speech text` is not rendered.
- Add is blocked when Name is empty.
- Selected tiles populate Name.
- Name edits update the selected tile/item and dirty toolState.
- `D&D Dungeon Master` applies rate `0.8`, pitch `0.5`, volume `1`, and SSML-like preset `normal`.

Expected pass behavior: named speech starts append active speakers without canceling existing ones, removed fields stay out of rendered/current queue data, and item naming changes remain schema-valid.

Expected fail behavior: Playwright fails if removed controls reappear, schema still requires repeat/delay, starting another speech item calls cancel, or Name can create invalid empty queue items.

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
npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list -g "Text to Speech V2"
node --check src/engine/audio/TextToSpeechDefaults.js
node --check src/engine/audio/TextToSpeechEngine.js
node --check tools/text2speach-V2/js/TextToSpeechToolApp.js
node --check tools/text2speach-V2/js/bootstrap.js
node --check tools/text2speach-V2/js/controls/ActionNavControl.js
node --check tools/text2speach-V2/js/controls/QueueControl.js
node --check tools/text2speach-V2/js/controls/SpeechOptionsControl.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('node:fs').readFileSync('tools/schemas/tools/text2speach-V2.schema.json','utf8')); console.log('schema ok')"
git diff --check HEAD -- .
rg -n -P "<script(?![^>]*\bsrc=)|<style|\son[a-zA-Z]+=" tools/text2speach-V2/index.html
rg -n "tools/shared|imageDataUrl|start_of_day" src/engine/audio tools/text2speach-V2 tools/schemas/tools/text2speach-V2.schema.json tests/playwright/tools/WorkspaceManagerV2.spec.mjs
```

The inline HTML restriction scan and forbidden-scope scan returned no matches. `git diff --check` reported only existing Windows line-ending warnings and no whitespace errors.

## V8 Coverage

The `npm run test:workspace-v2` run generated the Playwright V8 coverage report at:

```text
docs/dev/reports/playwright_v8_coverage_report.txt
```

Changed runtime JS coverage included:

- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `tools/text2speach-V2/js/TextToSpeechToolApp.js`
- `tools/text2speach-V2/js/bootstrap.js`
- `tools/text2speach-V2/js/controls/ActionNavControl.js`
- `tools/text2speach-V2/js/controls/QueueControl.js`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`

The coverage guard reported no low-coverage changed runtime JS files.

## Full Samples Smoke Test

Skipped. This PR is limited to Text to Speech V2 named speech runtime behavior, UI controls, schema/default queue data, and Workspace Manager V2 tool coverage. It does not modify the shared sample loader, sample JSON, or broad game launch behavior.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_016-text-to-speech-v2-named-speech-selection_delta.zip
```

## Manual Validation Steps

1. Open `tools/text2speach-V2/index.html`.
2. Confirm the center accordion reads `Text to Speak` and no visible `Speech text` label appears.
3. Confirm Repeat Count and Delay Between Repeats controls are absent.
4. Select different named speech tiles and confirm the Name input updates.
5. Edit Name and confirm the selected tile label updates.
6. Clear Name and click Add; confirm the status log blocks Add with an actionable message.
7. Start one named speech item, select another tile, and start it; confirm the log shows two active speakers and no global cancel.
8. Click Stop with multiple active speakers; confirm it refuses selected stop without global cancel.
9. Click Stop All; confirm all tracked speakers clear.
10. Select `D&D Dungeon Master` and confirm Rate is `0.8`, Pitch is `0.5`, Volume is `1`, and SSML-like preset is `normal`.

Expected outcome: named speech selection and playback remain independent, removed repeat fields are not rendered or required, and Name edits keep queue data schema-valid.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/schemas/tools/text2speach-V2.schema.json`
- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/js/TextToSpeechToolApp.js`
- `tools/text2speach-V2/js/bootstrap.js`
- `tools/text2speach-V2/js/controls/ActionNavControl.js`
- `tools/text2speach-V2/js/controls/QueueControl.js`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `tools/text2speach-V2/styles/text2speach-V2.css`
- `docs/dev/reports/PR_26130_016-text-to-speech-v2-named-speech-selection.md`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
