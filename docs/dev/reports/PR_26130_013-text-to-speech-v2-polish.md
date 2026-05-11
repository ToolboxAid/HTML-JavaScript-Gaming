# PR_26130_013-text-to-speech-v2-polish

## Purpose

Polish the existing `text2speach-V2` tool so user-facing surfaces read as `Text to Speech V2`, the header follows the shared first-class tool shell pattern, named sentence selection fully hydrates Speech Options, and Rate / Speed is capped to the practical browser `speechSynthesis` range used by the tool.

## Scope

Changed only Text to Speech V2 runtime/defaults/schema/UI, the visible tool registry/workspace navigation labels needed for launch surfaces, and targeted Workspace Manager V2 Playwright coverage.

The internal tool id, schema id, DOM ids, path, folder, and workspace toolState key remain `text2speach-V2`.

No `start_of_day` files were changed.

## Implementation Summary

- Updated visible tool title, card/nav labels, how-to/readme naming, sample copy, status messages, queue data name, and schema title to `Text to Speech V2`.
- Added the shared `toolShellCommon.css` header frame and kept the tool-specific header class for scoped styling/tests.
- Renamed the left queue accordion to `Named Sentences`.
- Added complete named sentence defaults so each queue item carries language, voice, gender, age, presets, queue mode, auto speak, repeat, delay, volume, rate, pitch, and text.
- Fixed named sentence selection hydration by rebinding the requested queue item voice when the selected item changes, preventing the previous voice selection from leaking into the newly selected item.
- Added `gender` to required queue item options and to the schema/default queue payload.
- Capped Rate / Speed at `2` in defaults, schema, UI range setup, engine utterance clamping, and Playwright assertions.

## Playwright Impact

Playwright impacted: Yes.

Coverage added/updated for:

- visible `Text to Speech V2` naming on the tools index, direct tool page, and Workspace Manager V2 launch tile
- shared header layout class on the Text to Speech V2 intro/header
- `Named Sentences` accordion label
- schema-complete named sentence defaults including required `gender`
- named sentence selection hydrating all Speech Options fields from selected JSON data
- Rate / Speed slider maximum and schema maximum capped at `2`
- updated status log text using the visible `Text to Speech V2` label

Expected pass behavior: selecting each named sentence updates text, gender, language, voice, age, presets, queue mode, repeat, delay, volume, rate, pitch, and summary state from the selected JSON item.

Expected fail behavior: tests fail if visible naming regresses to `text2speach-V2`, the shared header frame is missing, Rate / Speed exceeds `2`, queue items are schema-incomplete, or named sentence selection preserves stale option values.

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
node --check tools/text2speach-V2/js/TextToSpeechToolApp.js
node --check tools/text2speach-V2/js/controls/SpeechOptionsControl.js
node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js
node --check tools/toolRegistry.js
node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs
node -e "JSON.parse(require('node:fs').readFileSync('tools/schemas/tools/text2speach-V2.schema.json','utf8'));"
rg -n -P "<script(?![^>]*\bsrc=)|<style|\son[a-zA-Z]+=" tools/text2speach-V2/index.html tools/text2speach-V2/how_to_use.html
git diff --check HEAD -- .
```

The inline HTML restriction scan returned no matches. `git diff --check` reported only the existing Windows line-ending warnings and no whitespace errors.

## Full Samples Smoke Test

Skipped. The full samples smoke test is intentionally out of scope because this PR is limited to Text to Speech V2 polish, schema/default alignment, named sentence hydration, and targeted Workspace Manager V2 Playwright coverage.

## ZIP Artifact

Repo-structured delta ZIP:

```text
tmp/PR_26130_013-text-to-speech-v2-polish_delta.zip
```

## Manual Validation Steps

1. Open `tools/text2speach-V2/index.html`.
2. Confirm the browser title and visible heading read `Text to Speech V2`.
3. Confirm the intro/header uses the shared first-class tool shell framing and the queue accordion reads `Named Sentences`.
4. Select `Alert warning`, `Narrator welcome`, and `Hero ready`; Speech Options should update every option from the selected named sentence.
5. Confirm Rate / Speed cannot exceed `2`.

Expected outcome: user-facing naming is polished, the internal `text2speach-V2` contract is preserved, named sentences hydrate all speech options, and the practical Rate / Speed cap is enforced.

## Changed Files

- `src/engine/audio/TextToSpeechDefaults.js`
- `src/engine/audio/TextToSpeechEngine.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/schemas/tools/text2speach-V2.schema.json`
- `tools/text2speach-V2/README.md`
- `tools/text2speach-V2/how_to_use.html`
- `tools/text2speach-V2/index.html`
- `tools/text2speach-V2/js/TextToSpeechToolApp.js`
- `tools/text2speach-V2/js/controls/SpeechOptionsControl.js`
- `tools/text2speach-V2/styles/text2speach-V2.css`
- `tools/toolRegistry.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `docs/dev/reports/PR_26130_013-text-to-speech-v2-polish.md`
- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
