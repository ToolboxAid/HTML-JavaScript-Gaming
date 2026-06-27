# LEVEL_12_4_PLAYABLE_MULTIPLAYER_VALIDATION_FAILURE_MODES

## Failure-Mode Checklist (Minimal Slice)

1. Server startup failure
- Signal: runtime phase not `running`
- Validation impact: slice cannot begin

2. Handshake/session activation failure
- Signal: host/client session not `active`
- Validation impact: connect path invalid

3. Input ingestion rejection for valid action
- Signal: server rejects minimal `move` action envelope
- Validation impact: playable action path invalid

4. Authoritative state mutation missing
- Signal: server-side authoritative entity state unchanged after accepted action
- Validation impact: action does not propagate into authoritative state

5. Replication delivery/apply failure
- Signal: client ingestion/apply rejects or ignores primary authoritative update
- Validation impact: live replication not proven

6. Host/client observable divergence
- Signal: validation entity state differs after apply
- Validation impact: synchronization failure

7. Disconnect/cleanup failure
- Signal: session not `disconnected`, pending queues remain after shutdown
- Validation impact: session lifecycle closure invalid
