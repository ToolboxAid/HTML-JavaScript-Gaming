# MIDI JSON Metadata Notes

This file explains the structure of:
- `Inu_No_Omawari-san__full_verses_chords.json`

## Top-level fields

- `file`: Source MIDI filename used to create this JSON dump.
- `format`: MIDI file format (`0`, `1`, or `2`).
  - `0` = single track stream (can still include multiple channels).
  - `1` = multiple synchronous tracks.
- `tracks`: Number of MIDI tracks in the source file.
- `ppq`: Pulses per quarter note (timing resolution).
- `parsedTracks`: Parsed details for each track.

## Track fields (`parsedTracks[]`)

- `id`: MIDI chunk id (normally `MTrk`).
- `length`: Track chunk length in bytes.
- `meta`: Meta events (tempo, time signature, end-of-track, etc.).
- `programs`: Program changes (instrument selection) by channel.
- `notesCount`: Number of note objects parsed in that track.
- `notes`: Flattened note events with start/duration timing.

## Meta event fields (`meta[]`)

- `tick`: Absolute tick when the event occurs.
- `type`: Meta event type byte.
- `data`: Raw byte payload for that meta event.

Common meta types in this file:
- `81` (`0x51`): Tempo, 3-byte microseconds-per-quarter-note.
- `88` (`0x58`): Time signature.
- `89` (`0x59`): Key signature.
- `47` (`0x2F`): End of track.
- `3` (`0x03`): Track name.
- `33` (`0x21`): MIDI port.

## Program fields (`programs[]`)

- `tick`: Tick where program change occurs.
- `channel`: MIDI channel (`1-16` in this JSON view).
- `program`: General MIDI program number (`0-127`).

Examples:
- `0` = Acoustic Grand Piano
- `33` = Electric Bass (finger)
- `71` = Clarinet
- Full list: `GENERAL_MIDI_INSTRUMENTS.md`

## Note fields (`notes[]`)

- `channel`: MIDI channel (`1-16`; channel `10` is commonly drums in GM).
- `note`: MIDI note number (`0-127`).
  - `60` = Middle C (`C4` in common naming).
- `startTick`: Absolute tick where note starts.
- `durationTicks`: Note length in ticks.
- `velocity`: Note-on velocity (`1-127`, louder as value increases).

## Editing tips

- Keep `ppq` unchanged unless you regenerate timing everywhere.
- Change `velocity` for dynamics without changing rhythm.
- Change `programs` to swap instruments quickly.
- Preserve `meta` tempo/time signature if you want original timing behavior.
- If you edit a lot, prefer editing a simplified source model and regenerating MIDI.
