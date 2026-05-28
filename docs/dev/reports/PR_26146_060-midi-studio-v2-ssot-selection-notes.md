# PR_26146_060 MIDI Studio V2 SSoT Selection Notes

## Selected Instrument Ownership

- Canonical selected instrument state lives in `InstrumentGridControl.selectedInstrumentId`.
- Existing `selectedLane` reads/writes are now an accessor over `selectedInstrumentId` so older internal call sites do not create a second selected-instrument value.
- The Instruments tab rows and Octave Timeline quick rows both render from the same `previewLaneState` and selected instrument value.
- Selecting an instrument from either surface calls the same `handleLaneSelection()` / `selectLane()` flow.

## Owning Surfaces

- Song Setup owns editable song metadata: Name, derived/read-only Id, Tempo/BPM, Key, Style, Notes, Song Sheet fields, Sections/Loop fields, and Editing History placeholders.
- Song Setup no longer owns or displays editable Tags or Usage fields.
- Instruments owns GM Type, GM Instrument/Patch, Volume, Pan, add/delete, and future instrument placeholders.
- Octave Timeline owns note editing and quick performance/editing controls only: select, Mute, Solo, Hide/Show.
- Octave Timeline does not render Type or Instrument/Patch dropdowns.
- Export ownership and PR059 Save WAV/MP3/OGG wording remain unchanged.

## Audition Keyboard

- The old Play Middle C button was removed.
- Instruments now renders a generated horizontal keyboard from the selected instrument's octave range.
- Key clicks emit `audition-note` with the selected lane, selected instrument, note name, and Preview Synth mapping details.
- Wired Preview Synth audition remains normal styling; no unwired state is shown for the keyboard.

## Song Id Derivation

- Name edits derive Id through camelCase tokenization.
- Examples covered by Playwright:
  - `Camptown Races UAT Reel` -> `camptownRacesUatReel`
  - `New Song 4` -> `newSong4`
- Duplicate derived IDs receive a numeric suffix to preserve manifest uniqueness.
- Manual Id edits are ignored by default because Id is read-only in the Song Setup UI.
