Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A.md

# BUILD_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A

## Build Summary
Built Sample A as a standalone sample-backed network diagnostics slice under `games/network_sample_a/`.

## Implemented
1. Fake loopback network model
- synthetic connection phases (`disconnected`, `connecting`, `synchronizing`, `connected`)
- synthetic RTT and jitter values
- synthetic replication/pending packet counters
- bounded trace event stream

2. Sample integration
- new sample entry HTML and boot module
- sample scene with explicit input controls:
  - `Space` / `Enter` send packet
  - `C` disconnect
  - `R` reconnect
- debug integration wired via existing public API

3. Debug plugin integration
- read-only providers for connection, latency, and trace
- passive overlay panels:
  - connection status
  - latency / RTT
  - event trace
- command pack:
  - `network.help`
  - `network.status`
  - `network.latency`
  - `network.trace [count]`

## Validation
- sample renders and updates synthetic telemetry
- panels render expected diagnostics sections
- commands execute and return readable outputs
- no engine core files changed
