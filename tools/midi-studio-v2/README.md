# MIDI Studio V2

First-Class Tool V2 surface for manifest-owned MIDI song metadata.

Current scope:

- renders multiple songs from `game.manifest.json` root `music.songs`;
- honors `tools.midi-studio-v2.activeSongId` and `directorMode` preferences;
- displays `.mid` source paths, instrument sets, rendered WAV/MP3/OGG targets, loop metadata, tags, and Game Music Director notes;
- imports JSON game manifests through the primary Import JSON Manifest workflow;
- renders explicit `music.songs[].studioArrangement` data as editable Preview Synth tracks;
- treats `sourceMidi` as a `.mid` instruction file path, not browser-playable audio;
- inspects selected `.mid` source headers on request and displays format, track count, ticks-per-quarter-note, and validation status;
- uses Preview Synth for imported editable arrangements and browser media preview for rendered OGG/MP3/WAV targets;
- reports missing arrangement/rendered playback data visibly instead of loading hidden fallback songs;
- reports missing source paths and unsupported preview playback visibly;
- rejects invalid payloads before render.

Out of scope:

- MIDI input;
- recording;
- piano-roll or DAW editing;
- hidden fallback songs or sample data.

Playback distinction:

- manifest root `music.songs` stores song metadata;
- `studioArrangement` stores editable Preview Synth lane data for UAT and tool authoring;
- `sourceMidi` points to a `.mid` musical instruction file;
- `rendered` targets point to runtime audio assets that browser `Audio` may preview;
- future SoundFont or real MIDI playback requires shared `src/` MIDI parser, synth, and instrument capability.
- current source inspection uses a shared `src/engine/audio` MIDI metadata parser for Standard MIDI File headers only; it does not synthesize or schedule notes.
