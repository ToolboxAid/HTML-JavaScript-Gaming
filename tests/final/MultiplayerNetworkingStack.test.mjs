/*
Toolbox Aid
David Quesenberry
03/22/2026
MultiplayerNetworkingStack.test.mjs
*/
import assert from 'node:assert/strict';
import {
  ChatPresenceLayer,
  HandshakeSimulator,
  HostServerBootstrap,
  InterestManager,
  NetworkConditionSimulator,
  NetworkingLayer,
  PredictionReconciler,
  RemoteInterpolationBuffer,
  RollbackDiagnostics,
  SESSION_STATES,
  Serializer,
  StateReplication,
  createSessionLifecycle,
  getHandshakeContract,
  getSessionLifecycleContract,
  getTransportContract,
} from '../../src/engine/network/index.js';

export async function run() {
  const serializer = new Serializer({ version: 2 });
  const payload = serializer.roundTrip('net:test', { hp: 3 });
  assert.equal(payload.version, 2);
  assert.equal(payload.payload.hp, 3);

  const [host, client] = NetworkingLayer.createLinkedPair({
    hostId: 'host-a',
    clientId: 'client-b',
    sessionId: 'session-z',
    hostSimulator: new NetworkConditionSimulator({ baseLatencyMs: 20 }),
  });
  host.send('chat', { text: 'hi' });
  host.update(0.02);
  client.update(0.02);
  assert.equal(client.consumeReceived()[0].payload.text, 'hi');

  const transportContract = getTransportContract();
  assert.deepEqual(transportContract.requiredMethods, [
    'connect',
    'disconnect',
    'send',
    'drainInbox',
  ]);

  const lifecycleContract = getSessionLifecycleContract();
  assert.equal(lifecycleContract.states.ACTIVE, SESSION_STATES.ACTIVE);
  const lifecycle = createSessionLifecycle({
    sessionId: 'session-lifecycle',
    peerId: 'peer-a',
    role: 'client',
  });
  assert.equal(
    lifecycle.transition(SESSION_STATES.ACTIVE, 'skip-connect-handshake').ok,
    false,
  );
  assert.equal(lifecycle.transition(SESSION_STATES.CONNECTING, 'connect').ok, true);
  assert.equal(lifecycle.transition(SESSION_STATES.HANDSHAKING, 'hello').ok, true);
  assert.equal(lifecycle.transition(SESSION_STATES.ACTIVE, 'accepted').ok, true);
  assert.equal(lifecycle.getState(), SESSION_STATES.ACTIVE);

  const handshakeContract = getHandshakeContract();
  assert.deepEqual(handshakeContract.flow, [
    'session.handshake.hello',
    'session.handshake.accept',
    'session.handshake.confirm',
  ]);
  const handshake = new HandshakeSimulator({
    sessionId: 'session-handshake',
    hostId: 'host-h',
    clientId: 'client-h',
  });
  assert.equal(handshake.begin({ token: 'token-1' }), true);
  const activeHandshakeState = handshake.update();
  assert.equal(activeHandshakeState.handshakeComplete, true);
  assert.equal(activeHandshakeState.host.state, SESSION_STATES.ACTIVE);
  assert.equal(activeHandshakeState.client.state, SESSION_STATES.ACTIVE);
  const disconnectedHandshakeState = handshake.disconnect('test-closeout');
  assert.equal(disconnectedHandshakeState.host.state, SESSION_STATES.DISCONNECTED);
  assert.equal(disconnectedHandshakeState.client.state, SESSION_STATES.DISCONNECTED);

  const replication = new StateReplication();
  const snapshot = replication.createSnapshot([{ id: 'npc-1', x: 10, y: 20 }], { tick: 3 });
  const encoded = replication.encodeSnapshot(snapshot);
  const decoded = replication.decodeSnapshot(encoded);
  assert.equal(decoded.entities[0].id, 'npc-1');
  assert.equal(replication.applySnapshot(decoded).length, 1);

  const reconciler = new PredictionReconciler({
    applyInput: (state, input) => ({ ...state, x: state.x + input.dx }),
  });
  reconciler.setState({ x: 0, y: 0 });
  reconciler.predict({ dx: 3 });
  reconciler.predict({ dx: 3 });
  const reconcileResult = reconciler.reconcile({ x: 2, y: 0 }, 1);
  assert.equal(reconcileResult.corrected, true);
  assert.equal(reconcileResult.replayedInputs, 1);

  const interpolation = new RemoteInterpolationBuffer();
  interpolation.push({ tick: 0, state: { x: 0, y: 0 } });
  interpolation.push({ tick: 10, state: { x: 100, y: 0 } });
  assert.equal(Math.round(interpolation.sample(5).x), 50);

  const bootstrap = new HostServerBootstrap();
  bootstrap.startHost({ sessionId: 'lobby-1', hostId: 'host-1' });
  bootstrap.attachClient('client-1');
  assert.equal(bootstrap.getState().attachedClients.length, 1);

  const interest = new InterestManager();
  const relevant = interest.filterForViewer(
    { id: 'p1', x: 0, y: 0 },
    [{ id: 'p1', x: 0, y: 0 }, { id: 'near', x: 20, y: 0 }, { id: 'far', x: 999, y: 0 }],
    { radius: 50 },
  );
  assert.equal(relevant.length, 2);

  const chat = new ChatPresenceLayer();
  chat.connect('session-chat', 'host');
  chat.connect('session-chat', 'guest');
  chat.sendMessage('session-chat', 'guest', 'Hello');
  assert.equal(chat.getState('session-chat').messages.length, 1);

  const rollback = new RollbackDiagnostics();
  rollback.record({ frame: 10, corrected: true, replayedInputs: 2 });
  assert.equal(rollback.getSummary().corrections, 1);
}
