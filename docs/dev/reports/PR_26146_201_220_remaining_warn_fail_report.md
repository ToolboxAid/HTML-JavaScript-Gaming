# PR_26146_201_220 Remaining WARN/FAIL Report

MIDI Studio V2 FAIL Items:
- None known after final targeted UAT validation.

MIDI Studio V2 Workflow Blocker WARN Items:
- None known after final targeted UAT validation.

MIDI Studio V2 Non-blocking WARN/Future Items:
- Rendered audio Save WAV/MP3/OGG remains red/unwired until a real renderer exists.
- SoundFont/rendering configuration remains red/unwired until renderer integration exists.
- MIDI-to-canonical conversion remains red/unwired where incomplete.
- MIDI device input/recording remains red/unwired.
- History/snapshot controls remain red/unwired.
- Runtime Game Usage sync remains red/unwired.
- Sequence drag/drop remains red/unwired.

External Workspace WARN Items:
- `npm run test:workspace-v2` failed 23 Workspace Manager V2 tests unrelated to MIDI Studio V2.
- Main repeated failure: disabled workspace tool tile expectation still expects 11 tiles while the UI renders 12.
- One Asset Manager V2 workspace session-context test timed out.

Release Blocking Classification:
- PASS no in-scope MIDI Studio blocker remains.
- WARN unrelated workspace-v2 failures should be handled in a Workspace Manager V2 lane.

