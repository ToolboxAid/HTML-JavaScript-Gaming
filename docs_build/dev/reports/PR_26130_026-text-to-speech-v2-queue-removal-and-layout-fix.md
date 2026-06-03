# PR_26130_026-text-to-speech-v2-queue-removal-and-layout-fix

## Summary

Updated Text to Speech V2 and direct Workspace Manager V2/tool references for Queue Mode removal, canonical `text2speech-V2` launch paths, textarea sizing, status Clear behavior, and Speech Options internal scrolling.

## Changes

- Removed `queueMode` from Text to Speech V2 schema, defaults, sample JSON, UI controls, control hydration, engine runtime metadata, import/copy/export payloads, and positive Playwright expectations.
- Kept `queueMode` only in negative Playwright coverage to prove payloads containing the field fail schema validation.
- Removed the misspelled `text2speach-V2` redirect page, redirect script, alias schema file, alias sample JSON, tool registry alias, and Workspace Manager migration code.
- Updated Text to Speech V2 to use direct canonical `text2speech-V2` references for registry, workspace launch, sample launch, schema validation, and tests.
- Changed browser speech playback so Speak enqueues through `speechSynthesis.speak()` without a Queue Mode field or mode log; Stop remains the explicit queue clear action.
- Made `textarea#text2speech-V2SpeechText` fill `div#text2speech-V2TextContent.accordion-v2__content`, resize with accordion height, and keep manual resize disabled.
- Added internal vertical scrolling for Speech Options and preserved internal scrolling for Summary/Named Sentences.
- Stopped Clear button click propagation so Clear no longer toggles the Status accordion.

## Schema And Migration Notes

- `tools/schemas/tools/text2speech-V2.schema.json` remains a root array schema with `minItems: 1`.
- Each named speech item now requires: `id`, `name`, `text`, `gender`, `language`, `voice`, `voiceAge`, `volume`, `rate`, `pitch`, `characterPreset`, and `ssmlLikePreset`.
- `queueMode` is no longer allowed by `additionalProperties: false`.
- No `queueMode` import migration path is included in this PR. Existing payloads containing `queueMode` are rejected before render/import/save with an actionable schema validation message.
- The deleted `text2speach-V2` route/schema/sample are no longer redirect aliases. Legacy URL checks return 404 in Playwright, while canonical `text2speech-V2` launch paths continue to work.

## Validation

- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs` passed.
- `node --check tests/runtime/SampleStandaloneToolDataFlow.test.mjs` passed.
- `node --check` passed for changed Text to Speech V2/runtime JS files.
- `git diff --check` passed.
- `npm run test:workspace-v2` passed: 35 tests.
- Playwright V8 coverage report was produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Coverage guardrail was produced at `docs_build/dev/reports/coverage_changed_js_guardrail.txt` with no changed-runtime-JS warnings.

## Playwright Coverage

- Queue Mode is absent from UI/schema/sample/exported JSON.
- Payloads containing `queueMode` fail schema validation.
- Text to Speech V2 direct launch works from tools index, workspace launch, and sample 1903 wiring.
- Legacy `text2speach-V2` path/schema/sample references no longer redirect or load.
- Text to Speak textarea fills its accordion content and has resize disabled.
- Clear does not toggle the Status accordion.
- Speech Options scrolls internally.
- Workspace Manager V2 keeps Text to Speech V2 available after repo and game selection.

## Full Samples Smoke Test

Skipped. This PR is limited to Text to Speech V2 direct behavior and Workspace Manager V2 launch references, and `npm run test:workspace-v2` covers the requested behavior. The full samples smoke test remains out of scope because it is broad and long-running.

## Manual Validation

1. Open `/tools/text2speech-V2/index.html?samplePresetPath=/samples/phase-19/1903/sample.1903.text2speech-V2.json`.
2. Confirm Queue Mode is not visible and Output Summary contains only the named speech item array.
3. Confirm Import JSON rejects an item containing `queueMode`.
4. Confirm the Text to Speak textarea expands with the accordion and has no manual resize handle.
5. Confirm clicking Clear empties Status without collapsing the Status accordion.
6. Confirm `/tools/text2speach-V2/index.html` no longer redirects to the canonical tool.
