# PR_26146_141-160 SSoT Ownership Matrix

## Song Setup

| Canonical value | Editable owner | Non-owning displays |
| --- | --- | --- |
| `music.songs[].name` | Song Details | Export readiness, Diagnostics JSON |
| `music.songs[].classification` | Song Details | Classification guide, Export readiness, Manifest readiness |
| `music.songs[].id` | Generated read-only from Name and Classification | Generated ID preview, Export readiness |
| `music.songs[].director.notes` | Song Details | Diagnostics JSON |
| `music.songs[].director.usage` | Game Usage assignment in Song Details | Manifest readiness |
| `studioArrangement.tempo` | Song Details tempo field | Timeline, Diagnostics, Export readiness |
| `studioArrangement.key` | Song Details key field | Timeline, Diagnostics |
| `studioArrangement.style` | Song Details style field | Diagnostics |

## Song Sheet

| Canonical value | Editable owner | Non-owning displays |
| --- | --- | --- |
| musical sections | Song Sheet section editors | Available Sections, Timeline labels |
| custom sections | Song Sheet custom section editor | Available Sections |
| Song Sequence | Song Sheet sequence list | Timeline section headers |
| Apply Song Sheet To | Song Sheet target checkboxes | generation summary |
| generated/manual note counts | generated from canonical arrangement | Timeline badges, Export readiness |

## Instruments

| Canonical value | Editable owner | Non-owning displays |
| --- | --- | --- |
| GM type/patch | Instruments tab | Timeline quick row summaries |
| volume, pan, transpose | Instruments tab | Exported canonical JSON |
| octave range | Instruments tab | audition keyboard range display |
| selectedInstrumentId | shared tool selection state | Timeline quick select and Instruments tab reflect the same selected lane |

## Timeline

| Canonical value | Editable owner | Non-owning displays |
| --- | --- | --- |
| note grid cells | Octave Timeline canvas | JSON Details, source counts |
| quick mute/solo/hide | Octave Timeline quick controls | Instruments tab reflects state |
| playback preview state | Play/Stop and timeline preview controls | status/log surfaces |

## Diagnostics and Export

| Canonical value | Editable owner | Non-owning displays |
| --- | --- | --- |
| JSON Details | none, derived read-only | Copy JSON action only |
| Manifest readiness | none, derived read-only | Export and Diagnostics |
| Export readiness | Export tab | Diagnostics read-only mirror |
| rendered audio Save WAV/MP3/OGG | Export tab only | red/unwired until renderer exists |

