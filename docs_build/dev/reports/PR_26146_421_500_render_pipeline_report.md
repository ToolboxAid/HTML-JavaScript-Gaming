# PR_26146_421-500 Render Pipeline Report

## Render Ownership

Export tab owns the rendered output workflow:

- Output Type
- Save WAV
- Save MP3
- Save OGG
- Preview Engine
- SoundFont Asset
- Export Status
- Export/Manifest readiness

JSON export remains separate from rendered audio export.

## Implemented Render Path

PASS: Save WAV now renders from the SoundFont pipeline.

The WAV renderer:

- Uses the selected song.
- Uses the normalized Octave Timeline grid.
- Renders the full current timeline, not only the visible section.
- Uses selected instruments and lane settings.
- Applies volume, transpose, velocity, duration, and practical effects.
- Generates an `audio/wav` Blob.
- Starts the browser download using the existing Save action.

## Format Status

| Format | Status | Behavior |
| --- | --- | --- |
| WAV | PASS | Generated from the SoundFont render pipeline. |
| MP3 | FAIL/WARN honest | Marked encoder-unavailable; click reports no MP3 file was created. |
| OGG | FAIL/WARN honest | Marked encoder-unavailable; click reports no OGG file was created. |

## No False Success

Save MP3 and Save OGG do not claim success. They report that browser encoders are unavailable and no file was created.

## Playwright Coverage

The PR421-500 test verifies:

- WAV output Blob type is `audio/wav`.
- WAV output size is greater than the WAV header.
- MP3 and OGG Save controls are marked `encoder-unavailable`.
- MP3 and OGG clicks report FAIL.
