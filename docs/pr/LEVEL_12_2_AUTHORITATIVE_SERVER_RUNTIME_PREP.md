# LEVEL_12_2_AUTHORITATIVE_SERVER_RUNTIME_PREP

## Goal
Define implementation-ready boundaries for Level 12.2 authoritative server runtime so APPLY can be executed in one pass without engine API breakage.

## Runtime Contract Shape (Planned)

`AuthoritativeServerRuntime` should expose:

- `start({ sessionId, tickRateHz })`
- `stop(reason)`
- `step(dtSeconds)`
- `ingestClientInput(envelope)`
- `drainAcceptedInputs()`
- `getSnapshot()`

Runtime ownership:

- Owns authoritative tick/time counters.
- Owns authoritative input queue.
- Owns authoritative session status for runtime state.
- Does not mutate gameplay state directly in Level 12.2.

## Client Input Ingestion Contract (Planned)

`AuthoritativeInputIngestionContract` validates inbound envelopes with a stable shape:

- `sessionId` string
- `clientId` string
- `sequence` non-negative integer
- `inputType` string
- `payload` plain object
- `sentAtMs` finite number

Validation behavior:

- Reject malformed envelopes with deterministic codes.
- Normalize accepted envelopes to a server-safe canonical shape.
- Preserve ingestion metadata for diagnostics (`acceptedAtTick`, `acceptedAtMs`).

## Server-Owned State Boundaries (Planned)

State fields that must be server-owned:

- `authoritativeTick`
- `runtimePhase` (`idle`, `running`, `stopped`, `failed`)
- `connectedClients` registry
- `acceptedInputQueue`

Boundary rules:

- Client-originated packets cannot directly mutate authoritative runtime fields.
- All mutation enters through `ingestClientInput` and `step`.
- External consumers receive read-only snapshots.

## Compatibility Guardrails

- Keep Level 12.1 handshake flow (`hello -> accept -> confirm`) intact and testable.
- Maintain existing exports; add new exports only.
- Avoid changes outside `src/engine/network/*` and targeted network tests.

## APPLY Readiness Checklist

- BUILD doc exists with exact targets and exact validation commands.
- Runtime and ingestion contracts have concrete method signatures.
- Ownership boundaries are explicit enough for deterministic tests.
- Handshake regression checks remain in validation path.
