Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A.md

# BUILD_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A

## Build Summary
Built a new sample-owned network diagnostics slice at `games/network_sample_a/` using fake loopback telemetry and existing public debug integration APIs.

## Implemented Scope
1. Fake network model
- synthetic phases (`disconnected`, `connecting`, `synchronizing`, `connected`)
- synthetic RTT and jitter feed
- synthetic replication counters and backlog
- bounded trace event feed

2. Sample integration
- new sample entry HTML and boot path
- debug integration wired with overlay hidden by default
- sample controls for packet inject/disconnect/reconnect

3. Debug plugin
- read-only provider descriptors for connection/latency/trace
- passive overlay panels:
  - connection status
  - latency / RTT
  - event trace
- operator commands:
  - `network.help`
  - `network.status`
  - `network.latency`
  - `network.trace [count]`

## Scope Safety
- no engine core API changes
- no runtime transport/protocol work
- sample-level integration only
