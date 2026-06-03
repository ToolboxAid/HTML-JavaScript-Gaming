# PR_26146_040 MIDI Studio V2 Piano Key Grid Height Validation

Status: PASS

## Scope

- Refined MIDI Studio V2 Octave Timeline left note labels into piano-style key rows.
- Set the octave spreadsheet viewport to 50% of screen height with vertical scrolling.
- Preserved square cells, zoom controls, synced horizontal scrolling, active note highlights, editing, and Play/Stop behavior.
- Roadmap was not changed because this PR did not provide an execution-backed roadmap status transition request.

## Files Changed

- `tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- `tools/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`
- `docs_build/dev/reports/PR_26146_040-midi-studio-v2-piano-key-grid-height_validation.md`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

Review artifacts are generated separately:

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`

## Validation Commands

PASS:

```powershell
node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
node -e "const fs=require('fs'); for (const file of ['tools/midi-studio-v2/styles/midiStudioV2.css']) { const text=fs.readFileSync(file,'utf8'); let depth=0; for (const ch of text) { if (ch==='{') depth++; if (ch==='}') depth--; if (depth<0) throw new Error(file+': unexpected }'); } if (depth!==0) throw new Error(file+': unbalanced braces'); console.log(file+': CSS brace check OK'); }"
npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "octave timeline freezes compact headers and note labels while active cells stay textless|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000
git diff --check
```

Playwright result:

```text
Running 2 tests using 1 worker

ok 1 MIDI Studio V2 - fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync
ok 2 MIDI Studio V2 - octave timeline freezes compact headers and note labels while active cells stay textless

2 passed
```

Notes:

- `git diff --check` exited 0. Git emitted line-ending warnings for existing LF/CRLF handling in touched files; no whitespace errors were reported.
- An initial expanded Playwright command also included `updates play and stop control state without requiring real audio output`; that standalone legacy test timed out during V8 coverage cleanup. The final focused passing command covers Play/Stop through the fast-edit keyboard workflow and direct Play/Stop button assertions added to the PR040 grid test.

## Test Evidence

- Left key/chord column has no independent fixed row height: Playwright verifies piano row label height tracks square note cell height and changes with zoom.
- Natural and sharp/flat piano rows are visually distinct: Playwright verifies `white` and `black` key kinds, CSS classes, colors, and labels.
- Row alignment: Playwright verifies C5 and C#5 labels align with matching timeline cells by top and height.
- Grid viewport height: Playwright verifies `#instrumentGridOutput` renders at 50% of `window.innerHeight`.
- Vertical scrolling: Playwright verifies the grid can scroll vertically and header rows stay frozen beneath the top horizontal scrollbar.
- Horizontal scrolling: Playwright verifies top scrollbar, native bottom scroll, and header/body positions remain synchronized.
- Square cells and zoom controls: Playwright verifies width equals height and zoom in/out changes square cell size without breaking header/body alignment.
- Editing: Playwright verifies active notes remain highlighted without printed note text and cells remain editable after zoom changes.
- Play/Stop: Playwright verifies Space keyboard Play/Stop and button Play/Stop state transitions.

## Samples

Full samples smoke test: SKIP.

Reason: PR scope is limited to MIDI Studio V2 tool UI/runtime and targeted Playwright coverage; sample JSON alignment and full samples smoke are explicitly out of scope.

## Manual UAT

1. Open MIDI Studio V2 and import the UAT manifest.
2. Confirm the Octave Timeline viewport is about half the screen height and vertical scrolling reveals additional notes.
3. Scroll horizontally and confirm left piano-style labels stay frozen and aligned with rows.
4. Use zoom in/out and confirm cells remain square while key labels stay aligned.
5. Toggle notes/chords and confirm highlighted notes stay textless.
6. Start and stop playback and confirm the playhead/header behavior remains aligned.
