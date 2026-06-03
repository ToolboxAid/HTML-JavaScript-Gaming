# PR_26146_133-140 SSoT Ownership Matrix

Status: PASS

Canonical value | Editable owner | Derived/read-only surfaces | Result
--- | --- | --- | ---
Song name | Song Setup / Song Details | Song list, action nav, export source, diagnostics | PASS
Classification | Song Setup / Song Details | generated ID preview, export source, diagnostics, classification guide | PASS
Generated ID | derived from Name + Classification | Song Details read-only ID, export source, diagnostics | PASS
Tempo | Song Setup | playback tempo and diagnostics | PASS
Key | Song Setup | diagnostics and generation context | PASS
Style | Song Setup | diagnostics and generation context | PASS
Song Sheet sections | Song Setup first-class section editors and custom section editor | Available Sections, sequence labels, timeline sections, diagnostics | PASS
Song Sequence | Song Setup sequence builder | Octave Timeline section labels and playback/build order | PASS
Apply Song Sheet To | Song Setup | generation summary and lane mapping | PASS
Instrument GM/type/patch/settings | Instruments tab | Octave Timeline read-only lane summaries and audition context | PASS
selectedInstrumentId | Instruments and Octave Timeline selection actions | Audition keyboard dataset and selected row highlights | PASS
Generated/manual notes | Octave Timeline and Auto-Create Parts canonical arrangement | counts, diagnostics, export readiness | PASS
Rendered target paths | Export tab target fields | status, diagnostics, manifest readiness | PASS
Rendered Save WAV/MP3/OGG | Export tab | none | PASS as visible red/unwired future renderer
Diagnostics | Diagnostics tab | read-only derived surfaces except explicit Copy JSON / Clear Status actions | PASS
Workspace save ownership | Workspace Manager | MIDI Studio Workspace nav proxy | PASS

Duplicate editable ownership:
- PASS targeted Playwright scanned visible controls across Song Setup, Octave Timeline, Instruments, Auto-Create Parts, MIDI Import, Diagnostics, and Export.
- PASS no canonical editable value had more than one editable owner.

Notes:
- Timeline quick instrument controls remain action/sync surfaces; Instruments tab owns editable instrument details.
- Rendered audio save controls remain Export-owned but red/unwired because real rendering is not complete.
