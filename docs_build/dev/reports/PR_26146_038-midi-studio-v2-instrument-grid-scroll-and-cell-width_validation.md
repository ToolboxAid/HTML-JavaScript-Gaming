# PR_26146_038 MIDI Studio V2 Instrument Grid Scroll And Cell Width Validation

## Scope

- Continued from PR_26146_037.
- Confirmed `#instrumentGridOutput` remains the octave/grid spreadsheet container.
- Added a top horizontal scrollbar proxy inside `#instrumentGridOutput`.
- Preserved the native bottom horizontal scrollbar on `#instrumentGridOutput`.
- Synchronized top proxy scroll, bottom/native scroll, and the grid header/body horizontal position.
- Changed octave note/grid columns to 1px and set note cells to 1px width while preserving 1px borders.
- Preserved readable frozen note labels, compact Bar/Beat header alignment, active-note textless highlights, multi-note/chord editing, Play/Stop, Bar/Beat-only playback highlighting, JSON header Copy JSON placement, and export Type + Save behavior.

## Files Changed

- `toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- `toolbox/midi-studio-v2/styles/midiStudioV2.css`
- `tests/playwright/tools/MidiStudioV2.spec.mjs`

## Validation Commands

```powershell
node --check toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js
node --check tests/playwright/tools/MidiStudioV2.spec.mjs
node -e "const fs=require('fs'); const p='toolbox/midi-studio-v2/styles/midiStudioV2.css'; const css=fs.readFileSync(p,'utf8'); if(/\/\*[^]*$/.test(css.replace(/\/\*[^]*?\*\//g,''))) throw new Error('Unclosed CSS comment'); let depth=0; for (const ch of css.replace(/\/\*[^]*?\*\//g,'')) { if (ch==='{') depth++; if (ch==='}') depth--; if (depth<0) throw new Error('Unexpected }'); } if (depth!==0) throw new Error('Unbalanced CSS braces'); console.log('CSS syntax guard passed:', p);"
npx.cmd playwright test tests/playwright/tools/MidiStudioV2.spec.mjs -g "octave timeline freezes compact headers and note labels while active cells stay textless|fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync|octave grid density supports icon controls and simultaneous chord editing|octave timeline editor is the default editable and playable Studio workflow|places Copy JSON in the JSON Details header and preserves copy behavior|exports through Type dropdown and Save without claiming files were written" --config=codex_playwright_system_chrome.config.cjs --reporter=list --workers=1 --timeout=60000
git diff --check
```

## Validation Result

PASS

## Syntax Checks

- PASS: `toolbox/midi-studio-v2/js/controls/InstrumentGridControl.js`
- PASS: `tests/playwright/tools/MidiStudioV2.spec.mjs`
- PASS: `toolbox/midi-studio-v2/styles/midiStudioV2.css` brace/comment guard

## Playwright Coverage

Targeted MIDI Studio V2 Playwright tests passed:

- PASS: `#instrumentGridOutput` exists and contains the octave spreadsheet grid.
- PASS: top horizontal scrollbar proxy is visible when grid content overflows.
- PASS: bottom/native horizontal scrollbar remains available through `#instrumentGridOutput`.
- PASS: top and bottom scroll positions synchronize in both directions.
- PASS: header/body horizontal positions remain synchronized after scrolling.
- PASS: note/grid cells inside `#instrumentGridOutput` have 1px width.
- PASS: note/grid cells retain a 1px border.
- PASS: frozen note labels remain visible and row-aligned during horizontal scroll.
- PASS: active note cells remain highlighted without printed note text.
- PASS: multi-note/chord editing still works.
- PASS: Play and Stop still work.
- PASS: Bar/Beat-only playback highlighting remains covered.
- PASS: JSON header Copy JSON placement and export Type + Save behavior remain covered.

Command result:

```text
6 passed (2.3m)
```

## Diff Check

- PASS: `git diff --check`
- Note: Git reported LF-to-CRLF working-copy notices for changed files only; no whitespace errors were reported.

## Full Samples Smoke Test

Not run, per request.

## PR Status

PASS. Top/bottom horizontal scroll synchronization and 1px note-cell width were both proven by targeted Playwright validation.
