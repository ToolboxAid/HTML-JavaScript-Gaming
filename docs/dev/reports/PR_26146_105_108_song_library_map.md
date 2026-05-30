# PR_26146_105-108 Song Library Map

## Ownership
- Owner surface: Song Setup.
- Runtime asset store: MIDI Studio V2 Song Library UI state.
- Canonical write target: `music.songs[]` and `tools.midi-studio-v2.activeSongId`.

## Controls
- `#saveSongButton`: saves the selected canonical song as a reusable Song Library asset.
- `#loadSongButton`: loads the selected Song Library asset as a new canonical song.
- `#duplicateSongButton`: duplicates the selected canonical song directly into `music.songs[]`.
- `#songLibrarySelect`: selects a saved Song Library asset.
- `#songLibrarySummary`: reports saved asset count and last workflow result.

## ID Preservation
- Loaded and duplicated songs preserve Classification metadata.
- New canonical songs receive generated IDs from `camelCase(Name) + "-" + Classification`.
- Copy names are uniqued before ID derivation to avoid hidden ID collisions.

## Canonical Integrity
- Save Song does not mutate the canonical model.
- Load Song and Duplicate Song add full cloned song objects to `music.songs[]`.
- The loaded or duplicated song becomes the active selected song.
- The Octave Timeline and JSON Details refresh from the selected canonical song.

## Validation
- Playwright verifies saved asset count, duplicate insertion, load insertion, active song ID, selected song name, and canonical song count.
