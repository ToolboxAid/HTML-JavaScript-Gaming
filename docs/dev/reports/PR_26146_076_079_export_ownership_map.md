# PR_26146_076_079 Export Ownership Map

| Surface | Owner | Editable/read-only | Wired status | Notes |
| --- | --- | --- | --- | --- |
| Export tab | Export | Workflow owner | Mixed | Only tab that owns rendered audio output workflow. |
| Output Type dropdown | Export | Future rendered output selection | Red/unwired | Retained for WAV, MP3, OGG selection; renderer is not implemented. |
| Save WAV/MP3/OGG button | Export | Future rendered output action | Red/unwired | Uses Save wording for rendered audio and reports WARN when a target exists but no renderer exists. |
| WAV target path | Export | Editable project metadata | Wired | `music.songs[].rendered.wav` |
| MP3 target path | Export | Editable project metadata | Wired | `music.songs[].rendered.mp3` |
| OGG target path | Export | Editable project metadata | Wired | `music.songs[].rendered.ogg` |
| Render Source | Export | Read-only derived | Wired | Selected song, playable event count, canonical song model / octave timeline source. |
| Export Status | Export | Read-only derived | Wired | Includes explicit owner note, renderer status, SoundFont status, and latest WARN/FAIL. |
| SoundFont | Export | Future placeholder | Red/unwired | Rendering prep only; SoundFont rendering intentionally not implemented. |
| Render Quality | Export | Future placeholder | Red/unwired | Not implemented. |
| Sample Rate | Export | Future placeholder | Red/unwired | Not implemented. |
| Normalize Volume | Export | Future placeholder | Red/unwired | Not implemented. |
| Export Stems | Export | Future placeholder | Red/unwired | Not implemented. |
| Loop Export | Export | Future placeholder | Red/unwired | Not implemented. |
| Rendered Target Diagnostics | Diagnostics | Read-only derived | Wired | Displays target paths only; no editable export controls. |
| JSON Details / Export JSON | Diagnostics / Export Status | JSON state workflow | Wired | JSON wording remains Import JSON / Export JSON and is not rendered audio export. |

No rendered audio export controls were added outside the Export tab.

