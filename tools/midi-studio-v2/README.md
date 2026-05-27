# MIDI Studio V2

First-Class Tool V2 surface for manifest-owned MIDI song metadata.

Current scope:

- renders multiple songs from `game.manifest.json` root `music.songs`;
- honors `tools.midi-studio-v2.activeSongId` and `directorMode` preferences;
- displays `.mid` source paths, instrument sets, rendered WAV/MP3/OGG targets, loop metadata, tags, and Game Music Director notes;
- treats `sourceMidi` as a `.mid` instruction file path, not browser-playable audio;
- uses browser media preview only for rendered OGG/MP3/WAV targets;
- reports live MIDI synthesis as not implemented until shared MIDI parser/synth/instrument capability exists;
- reports missing source paths and unsupported preview playback visibly;
- rejects invalid payloads before render.

Out of scope:

- MIDI input;
- recording;
- piano-roll or DAW editing;
- hidden fallback songs or sample data.

Playback distinction:

- manifest root `music.songs` stores song metadata;
- `sourceMidi` points to a `.mid` musical instruction file;
- `rendered` targets point to runtime audio assets that browser `Audio` may preview;
- future real MIDI playback requires shared `src/` MIDI parser, synth, and instrument capability.
