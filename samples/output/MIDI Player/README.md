# MIDI Player Sample

This sample demonstrates browser MIDI playback using:
- `engine/output/midiPlayer.js`
- a simple UI in `index.html`
- sample control wiring in `midiPlayerSample.js`

Design choice: this sample is intentionally DOM-driven at the page level, while transport actions are routed through a small orchestration layer in `midiPlayerSample.js`.

## Files

- `index.html`: sample page and controls
- `midiPlayerSample.js`: UI/event wiring, validation, and status messaging
- `midi/Inu_No_Omawari-san__Misc_Children.mid`: bundled sample MIDI file
- `midi/Inu_No_Omawari-san__Misc_Children_2.mid`: bundled sample MIDI file

## Controls

- File input: load a `.mid`, `.midi`, or `.kar` file
- `Play`: start playback
- `Pause`: pause playback
- `Stop`: stop playback
- `Position`: seek position slider (runtime support depends on MIDI library)
- `Autoplay`: auto-play loaded files

## Runtime Notes

- `MidiPlayer` loads external scripts from:
  - `https://fraigo.github.io/javascript-midi-player/midiplayer/WebAudioFontPlayer.js`
  - `https://fraigo.github.io/javascript-midi-player/midiplayer/MIDIFile.js`
  - `https://fraigo.github.io/javascript-midi-player/midiplayer/MIDIPlayer.js`
- Browser support and output quality can vary based on audio/MIDI runtime capabilities.
- UI status/error text is intentionally generic and user-safe (no raw stack traces or internal error dumps).

## Lifecycle

`midiPlayerSample.js` calls `destroy()` on `beforeunload` for defensive cleanup; this path is idempotent to avoid duplicate teardown work.
