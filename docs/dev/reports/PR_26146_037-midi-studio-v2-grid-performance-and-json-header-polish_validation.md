# PR_26146_037 MIDI Studio V2 Grid Performance And JSON Header Polish Validation

## Scope

- Continued from PR_26146_036.
- Moved `Copy JSON` from the top action nav into the `JSON Details` accordion header.
- Kept `Copy JSON` behavior unchanged through the existing `toolCopyJsonButton` wiring.
- Advanced the MIDI Studio V2 roadmap by changing only the execution-backed optional per-note velocity/duration marker from `[ ]` to `[.]`.
- Reduced playback playhead visual work so playback highlights only the Bar/Beat timing header cells for the current step.
- Removed playback-time note-cell and lane-cell highlighting.
- Changed spreadsheet/grid cell borders to 1px.
- Removed vertical spacing between the Bar and Beat sticky header rows.
- Preserved alternating row color, frozen left note labels, header/body horizontal sync, compact row height, active-note textless highlight behavior, Play/Stop, chord editing, export Type + Save, and manifest import.

## Files Changed

- `docs/dev/roadmaps/MIDI_STUDIO_V2_ROADMAP.md`
- `tools/midi-studio-v2/index.html`
- `tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- `tools/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`

## Validation Commands

```powershell
node --check tools/midi-studio-v2/js/controls/InstrumentGridControl.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
node -e "const fs=require('fs'); const p='tools/midi-studio-v2/index.html'; const html=fs.readFileSync(p,'utf8'); if(/<script(?![^>]*\ssrc=)[^>]*>/i.test(html)) throw new Error('Inline script block found'); if(/<style\b/i.test(html)) throw new Error('Inline style block found'); if(/\son[a-z]+\s*=/i.test(html)) throw new Error('Inline event handler found'); console.log('HTML external-only guard passed:', p);"
node -e "const fs=require('fs'); const p='tools/midi-studio-v2/styles/midiStudioV2.css'; const css=fs.readFileSync(p,'utf8'); if(/\/\*[^]*$/.test(css.replace(/\/\*[^]*?\*\//g,''))) throw new Error('Unclosed CSS comment'); let depth=0; for (const ch of css.replace(/\/\*[^]*?\*\//g,'')) { if (ch==='{') depth++; if (ch==='}') depth--; if (depth<0) throw new Error('Unexpected }'); } if (depth!==0) throw new Error('Unbalanced CSS braces'); console.log('CSS syntax guard passed:', p);"
npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "places Copy JSON in the JSON Details header and preserves copy behavior|roadmap and implementation audit exist with actual MIDI Studio V2 status markers|octave timeline freezes compact headers and note labels while active cells stay textless|octave grid density supports icon controls and simultaneous chord editing|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync|exports through Type dropdown and Save without claiming files were written|octave timeline editor is the default editable and playable Studio workflow" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000
git diff --check
```

## Validation Result

PASS

## Syntax And Static Checks

- PASS: `tools/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `tools/midi-studio-v2/index.html` external-only guard
- PASS: `tools/midi-studio-v2/styles/midiStudioV2.css` brace/comment guard

## Playwright Coverage

Targeted MIDI Studio V2 Playwright tests passed:

- PASS: `Copy JSON` is in the `JSON Details` header between the title and accordion close/control icon.
- PASS: `Copy JSON` still writes the MIDI Studio V2 toolState JSON to the Clipboard API when available.
- PASS: roadmap markers use only `[ ]`, `[.]`, and `[x]`, with the optional per-note velocity/duration item advanced to `[.]`.
- PASS: playback highlights only Bar/Beat timing header fields.
- PASS: playback no longer applies playhead highlighting to note cells per tick.
- PASS: Bar/Beat vertical header gap is removed.
- PASS: grid cells use a 1px CSS border.
- PASS: header/body horizontal scroll sync and frozen left note labels remain correct.
- PASS: active notes still render as highlights without printed note text.
- PASS: chord editing, fast editing, Play/Stop, and export Type + Save remain covered.

Command result:

```text
7 passed (1.7m)
```

## Diff Check

- PASS: `git diff --check`
- Note: Git reported LF-to-CRLF working-copy notices for changed files only; no whitespace errors were reported.

## Full Samples Smoke Test

Not run, per request.

## PR Status

PASS. Playback no longer repaints/highlights the full note grid every tick; the active playback visual is limited to the current Bar/Beat timing header cells.
