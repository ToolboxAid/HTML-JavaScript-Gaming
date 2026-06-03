# PR_26146_043 MIDI Studio V2 Piano Roll Keyboard Grid Validation

Status: PASS

## Scope

- Updated the Studio tab Octave Timeline note axis so it reads as a piano-roll keyboard instead of a plain table label column.
- Preserved the single active Octave Timeline editor from PR042: one rendered editor, Studio tab only.
- Preserved active timeline notes as highlighted cells without printed note text.
- Preserved frozen Bar/Beat header alignment, square cells, zoom controls, vertical scrolling, horizontal scrolling, multi-note/chord editing, section/loop feedback, and Play/Stop.

## Files Changed

- `toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- `toolbox/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`
- `docs_build/dev/reports/PR_26146_043-midi-studio-v2-piano-roll-keyboard-grid_validation.md`
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
node --check toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
node -e "const fs=require('fs'); const p='toolbox/midi-studio-v2/index.html'; const html=fs.readFileSync(p,'utf8'); if(/<script(?![^>]*\ssrc=)[^>]*>/i.test(html)) throw new Error('Inline script block found'); if(/<style\b/i.test(html)) throw new Error('Inline style block found'); if(/\son[a-z]+\s*=/i.test(html)) throw new Error('Inline event handler found'); console.log('HTML external-only guard passed:', p);"
node -e "const fs=require('fs'); for (const file of ['toolbox/midi-studio-v2/styles/midiStudioV2.css']) { const text=fs.readFileSync(file,'utf8'); let depth=0; for (const ch of text) { if (ch==='{') depth++; if (ch==='}') depth--; if (depth<0) throw new Error(file+': unexpected }'); } if (depth!==0) throw new Error(file+': unbalanced braces'); console.log(file+': CSS brace check OK'); }"
npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "octave timeline freezes compact headers and note labels while active cells stay textless|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync|renders timing ruler, section navigation, and loop region visualization" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000
git diff --check
```

Playwright result:

```text
Running 3 tests using 1 worker

ok 1 MIDI Studio V2 - fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync
ok 2 MIDI Studio V2 - octave timeline freezes compact headers and note labels while active cells stay textless
ok 3 MIDI Studio V2 - renders timing ruler, section navigation, and loop region visualization

3 passed
```

Notes:

- An initial targeted run failed because a test still compared the plain row bed backgrounds; the piano key surfaces now live on the key-shape pseudo-elements. The assertion was corrected and the final targeted run passed.
- `git diff --check` exited 0. Git emitted line-ending warnings for touched files; no whitespace errors were reported.
- Full samples smoke test was not run.

## Test Evidence

- Piano-style keyboard keys: Playwright verifies the frozen note axis uses white and black key classes with different rendered key-surface colors.
- White keys are full-width: Playwright verifies the white key shape starts at the left edge and matches the keyboard axis width.
- Black keys are narrower/inset: Playwright verifies the black key shape starts inset, is narrower than the white key, and rises above its row bounds.
- Note letters are visible: Playwright verifies visible `C5` and `C#5` text layers with readable white-key and black-key colors.
- Vertical row alignment: Playwright verifies label/cell top and height deltas remain within 1px before and after zoom.
- Horizontal frozen behavior: Playwright scrolls horizontally and verifies the keyboard axis remains visible while header/body columns stay aligned.
- Active note cells remain textless: Playwright toggles an octave cell and verifies the cell text is empty while note metadata and highlight marker remain present.
- Single editor: Playwright verifies one `#instrumentGridOutput`, one `#instrumentGridHeading`, and one `.midi-studio-v2__octave-timeline`, visible only on Studio.
- Play and Stop: targeted Playwright verifies Play enables Stop and Stop re-enables Play.

## Coverage

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` reports changed runtime JS coverage.
- Changed runtime JS covered: `(80%) toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`.
- Changed non-runtime test JS is listed separately as not collected by browser V8 coverage.

## Samples

Full samples smoke test: SKIP.

Reason: PR scope is limited to MIDI Studio V2 tool UI/runtime and targeted Playwright coverage; sample JSON alignment and full samples smoke are explicitly out of scope.

## Manual UAT

1. Open MIDI Studio V2 and import the UAT manifest.
2. Confirm only the Studio tab shows the Octave Timeline editor.
3. Confirm the frozen left note axis visually reads as piano keys, with full-width white keys and inset black keys.
4. Click and drag a few notes, zoom in/out, scroll vertically and horizontally, then confirm Play and Stop still work.
