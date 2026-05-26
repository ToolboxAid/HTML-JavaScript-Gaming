# MIDI Studio V2

First-Class Tool V2 surface for manifest-owned MIDI song metadata.

Current scope:

- renders multiple songs from `game.manifest.json` root `music.songs`;
- honors `tools.midi-studio-v2.activeSongId` and `directorMode` preferences;
- displays `.mid` source paths, instrument sets, rendered WAV/MP3/OGG targets, loop metadata, tags, and Game Music Director notes;
- attempts browser media preview for selected `.mid` sources;
- reports missing source paths and unsupported preview playback visibly;
- rejects invalid payloads before render.

Out of scope:

- MIDI input;
- recording;
- piano-roll or DAW editing;
- hidden fallback songs or sample data.

Future `src/` follow-up: add shared MIDI parsing/synthesis/rendering capability when live MIDI preview and rendered WAV/MP3/OGG export move beyond this first usable metadata surface.
