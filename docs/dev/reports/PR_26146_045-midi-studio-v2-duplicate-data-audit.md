# PR_26146_045 MIDI Studio V2 Duplicate Data Audit

Status: PASS

## Canonical Model Fields

MIDI Studio V2 now treats the normalized `payload` as the canonical runtime model:

- `payload.songs[]`
- `payload.activeSongId`
- `song.id`
- `song.name`
- `song.studioArrangement.tempo`
- `song.studioArrangement.key`
- `song.studioArrangement.style`
- `song.studioArrangement.sections`
- `song.studioArrangement.lanes`
- `song.studioArrangement.previewInstruments`
- `song.loop`
- `song.rendered`
- `song.defaultRuntimeFormat`
- `song.sourceMidi`
- `song.instrumentSet`
- `song.director`
- `song.tags`

The active song is resolved from `payload.activeSongId`. `selectedSongId` is no longer stored as independent app state.

## Duplicate Data Found

- `selectedSongId` duplicated `payload.activeSongId`.
- `lastInstrumentGridResult` held unscoped parsed timeline state that could be mistaken for canonical song data.
- `lastSongSheetResult` held parser state outside the selected song arrangement even though BPM/key/style belong to `song.studioArrangement`.
- Guided Song Sheet inputs and Timeline source inputs could diverge from `song.studioArrangement` unless normalization pushed edits back into the selected song.

## Duplicate UI Found

- `#songSheetSummary` repeated parser-only section/chord metadata in the primary Song Setup flow while Timeline Diagnostics already reports the active normalized grid.
- Previous raw Song Sheet and duplicate Song Sheet summary surfaces remain absent.
- MIDI source inspection is kept as a read-only source diagnostic, not a primary runtime model.

## Removals Made

- Removed `#songSheetSummary` from Selected Song Details.
- Removed required bootstrap dependency on `#songSheetSummary`; Song Sheet summary rendering is now optional.
- Removed stored `selectedSongId` app state in favor of `payload.activeSongId`.
- Removed stored `lastSongSheetResult` app state.
- Replaced unscoped `lastInstrumentGridResult` storage with selected-song-scoped derived grid results.

## Canonical Derivation

- Song list derives from `payload.songs[]` and `payload.activeSongId`.
- Selected Song Details derive from the selected canonical `song`.
- Song Sheet controls derive from `song.studioArrangement`.
- Instrument rows derive from `song.studioArrangement.lanes` and `song.studioArrangement.previewInstruments`.
- Octave Timeline derives from parsing `song.studioArrangement` through `InstrumentGridParser`.
- Playback derives from the selected song's current parsed grid result and selected lane settings.
- Rendered export status derives from `song.rendered` and `song.defaultRuntimeFormat`.
- ToolState export serializes the canonical `payload`.
- Diagnostics are read-only derived views.

## Remaining Intentional Derived Views

- `InstrumentGridParser` output is retained as a selected-song-scoped derived view for rendering and playback scheduling.
- `SongSheetParser` output is used transiently for validation/status and then synced into `song.studioArrangement`.
- Audio Diagnostics derive from Preview Synth state, selected song, selected section, and selected instrument lane settings.
- MIDI Source Details are read-only inspection results for the selected song source; imported MIDI remains a conversion/input source into the canonical song payload, not a second primary runtime model.

## UAT Risk

No UAT-blocking duplicate song, instrument, or timeline state remains in the primary workflow after this PR. If a future parser adds new conversion data, it must write into `payload.songs[]` / `song.studioArrangement` before becoming editable or playable.
