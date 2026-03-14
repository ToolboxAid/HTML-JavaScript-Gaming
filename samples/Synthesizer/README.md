# Synthesizer Sample

This sample demonstrates browser-based sound synthesis with:
- Live keyboard note playback
- Song playback buttons
- Real-time sound shaping controls

## Files

- `index.html`: page + control/button layout
- `synth.js`: input handling, UI wiring, playback triggers
- `synth.css`: keyboard and control styling
- `pianoPlayer.js`: piano arrangement data
- `songs/`: song data modules

## Keyboard Controls

Physical keys mapped to notes:

- `A W S E D F T G Y` -> `C C# D D# E F F# G G#`
- `H U J` -> `A A# B`
- `K O L P ;` -> `C C# D D# E` (next octave)

## UI Controls

- `Time Signature` (example: `4/4`)
- `Tempo (BPM)`
- `Waveform`: `Triangle`, `Sine`, `Square`, `Sawtooth`
- `Attack`
- `Release`
- `Vibrato Depth`
- `Delay Mix`

## Song Buttons

- Play `Frogger` music
- Play `Comming around the mountain` music
- Play `Twinkle Twinkle Little Star`
- Play `Piano` arrangement (`loveStoryInspiredPiano`)
- `Stop / Panic` to immediately stop active/scheduled notes

## Song Data Modules

- `songs/froggerSong.js`
- `songs/comingAroundMountainSong.js`
- `songs/twinkleTwinkleSong.js`
- `pianoPlayer.js`

## Browser Audio Note

Some browsers require user interaction before audio can start.  
Click a button or press a key once if sound is muted on first load.

Invalid tempo or time-signature input is shown inline and the previous valid values are retained.
