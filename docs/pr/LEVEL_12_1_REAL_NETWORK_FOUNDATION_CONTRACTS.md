# LEVEL_12_1_REAL_NETWORK_FOUNDATION_CONTRACTS

## Transport Abstraction Boundary

`src/engine/network/TransportContract.js` defines the minimum runtime boundary for transport implementations:

- Required methods: `connect(remote)`, `disconnect()`, `send(packet)`, `drainInbox()`
- Optional connection introspection: `isConnected()`, `getConnectionState()`, or `getState()`
- Packet ownership split:
  - Caller-owned fields: `type`, `sessionId`, `from`, `payload`
  - Transport-owned metadata: `createdAt`, `simulatedDelayMs`

The boundary is enforced via `assertTransportContract(...)` and wrapped with `createTransportBoundary(...)`.

## Session Lifecycle Contract

`src/engine/network/SessionLifecycleContract.js` defines explicit session states and valid transitions.

States:

- `idle`
- `connecting`
- `handshaking`
- `active`
- `disconnecting`
- `disconnected`
- `failed`

Transition rules are centralized in `ALLOWED_TRANSITIONS` and exposed through:

- `getSessionLifecycleContract()`
- `createSessionLifecycle(...)`

Each transition is validated (`canTransition`) and recorded in state history.

## Minimal Handshake Flow

`src/engine/network/HandshakeSimulator.js` implements a deterministic, transport-backed handshake simulation:

1. Client sends `session.handshake.hello`
2. Host responds with `session.handshake.accept`
3. Client sends `session.handshake.confirm`
4. Both peers reach `active` session state

Disconnect simulation:

- Host emits `session.handshake.bye`
- Both peers transition through `disconnecting` to `disconnected`

`getHandshakeContract()` documents message names and expected flow order.
