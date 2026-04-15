/*
Toolbox Aid
David Quesenberry
03/22/2026
MultiplayerNetworkingStack.test.mjs
*/
import assert from 'node:assert/strict';
import {
  AuthoritativeInputIngestionContract,
  AuthoritativeServerRuntime,
  ClientReplicationApplicationLayer,
  ClientReconciliationStrategy,
  ChatPresenceLayer,
  HandshakeSimulator,
  HostServerBootstrap,
  INPUT_INGESTION_REJECTION_CODES,
  InterestManager,
  LoopbackTransport,
  NetworkConditionSimulator,
  NetworkingLayer,
  PredictionReconciler,
  REPLICATION_IGNORE_REASONS,
  REPLICATION_MESSAGE_REJECTION_CODES,
  REPLICATION_SNAPSHOT_TYPES,
  ReplicationMessageContract,
  RemoteInterpolationBuffer,
  RollbackDiagnostics,
  SERVER_RUNTIME_INGEST_REJECTION_CODES,
  SERVER_RUNTIME_PHASES,
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

  const server = new AuthoritativeServerRuntime({
    sessionId: 'session-runtime',
    tickRateHz: 20,
  });
  const mirrorServer = new AuthoritativeServerRuntime({
    sessionId: 'session-runtime',
    tickRateHz: 20,
  });
  assert.equal(server.start().runtimePhase, SERVER_RUNTIME_PHASES.RUNNING);
  assert.equal(mirrorServer.start().runtimePhase, SERVER_RUNTIME_PHASES.RUNNING);

  const tickStepPlan = [0.01, 0.04, 0.05, 0.10];
  tickStepPlan.forEach((dtSeconds) => {
    const serverStep = server.step(dtSeconds);
    const mirrorStep = mirrorServer.step(dtSeconds);
    assert.equal(serverStep.ok, true);
    assert.equal(mirrorStep.ok, true);
    assert.equal(serverStep.ticksAdvanced, mirrorStep.ticksAdvanced);
  });
  assert.equal(server.getSnapshot().authoritativeTick, 4);
  assert.equal(server.getSnapshot().authoritativeTick, mirrorServer.getSnapshot().authoritativeTick);

  const ingestionContract = new AuthoritativeInputIngestionContract({ sessionId: 'session-runtime' });
  const validationResult = ingestionContract.validate({
    sessionId: 'session-runtime',
    clientId: 'client-1',
    sequence: 0,
    inputType: 'move',
    payload: { dx: 1, dy: 0 },
    sentAtMs: 10,
  });
  assert.equal(validationResult.ok, true);

  const acceptedInput = server.ingestClientInput({
    sessionId: 'session-runtime',
    clientId: 'client-1',
    sequence: 0,
    inputType: 'move',
    payload: { dx: 1, dy: 0 },
    sentAtMs: 10,
  });
  assert.equal(acceptedInput.ok, true);

  const duplicateInput = server.ingestClientInput({
    sessionId: 'session-runtime',
    clientId: 'client-1',
    sequence: 0,
    inputType: 'move',
    payload: { dx: 2, dy: 0 },
    sentAtMs: 11,
  });
  assert.equal(duplicateInput.ok, false);
  assert.equal(
    duplicateInput.code,
    SERVER_RUNTIME_INGEST_REJECTION_CODES.DUPLICATE_OR_OUT_OF_ORDER_SEQUENCE,
  );

  const ownershipViolationInput = server.ingestClientInput({
    sessionId: 'session-runtime',
    clientId: 'client-1',
    sequence: 1,
    inputType: 'move',
    payload: { authoritativeTick: 999 },
    sentAtMs: 12,
  });
  assert.equal(ownershipViolationInput.ok, false);
  assert.equal(
    ownershipViolationInput.code,
    INPUT_INGESTION_REJECTION_CODES.SERVER_OWNERSHIP_VIOLATION,
  );

  const drainedInputs = server.drainAcceptedInputs();
  assert.equal(drainedInputs.length, 1);
  assert.equal(drainedInputs[0].acceptedAtTick, 4);
  assert.equal(drainedInputs[0].payload.dx, 1);

  const mutableSnapshot = server.getSnapshot();
  mutableSnapshot.authoritativeTick = 999;
  assert.equal(server.getSnapshot().authoritativeTick, 4);

  const stoppedSnapshot = server.stop('test-stop');
  assert.equal(stoppedSnapshot.runtimePhase, SERVER_RUNTIME_PHASES.STOPPED);
  const stopIngestReject = server.ingestClientInput({
    sessionId: 'session-runtime',
    clientId: 'client-1',
    sequence: 2,
    inputType: 'move',
    payload: { dx: 1 },
    sentAtMs: 20,
  });
  assert.equal(stopIngestReject.ok, false);
  assert.equal(
    stopIngestReject.code,
    SERVER_RUNTIME_INGEST_REJECTION_CODES.SERVER_RUNTIME_NOT_RUNNING,
  );

  const replicationContract = new ReplicationMessageContract({ sessionId: 'session-runtime' });
  const replicationValidation = replicationContract.validate({
    sessionId: 'session-runtime',
    replicationSequence: 10,
    authoritativeTick: 5,
    snapshotType: REPLICATION_SNAPSHOT_TYPES.FULL,
    snapshot: {
      entities: [{ id: 'npc-1', x: 10, y: 10 }],
      despawned: [],
    },
    sentAtMs: 100,
  });
  assert.equal(replicationValidation.ok, true);
  const invalidReplicationValidation = replicationContract.validate({
    sessionId: 'session-runtime',
    replicationSequence: 11,
    authoritativeTick: 5,
    snapshotType: REPLICATION_SNAPSHOT_TYPES.DELTA,
    snapshot: {
      entities: [{ id: 'npc-1', x: 11, y: 10 }],
      lastAppliedTick: 999,
    },
    sentAtMs: 101,
  });
  assert.equal(invalidReplicationValidation.ok, false);
  assert.equal(
    invalidReplicationValidation.code,
    REPLICATION_MESSAGE_REJECTION_CODES.CLIENT_METADATA_COLLISION,
  );

  const clientReplication = new ClientReplicationApplicationLayer({
    sessionId: 'session-runtime',
    reconciliationStrategy: new ClientReconciliationStrategy(),
  });
  assert.equal(clientReplication.ingestReplicationEnvelope({
    sessionId: 'session-runtime',
    replicationSequence: 10,
    authoritativeTick: 5,
    snapshotType: REPLICATION_SNAPSHOT_TYPES.FULL,
    snapshot: {
      entities: [
        { id: 'npc-1', x: 10, y: 10 },
        { id: 'npc-2', x: 4, y: 2 },
      ],
      despawned: [],
    },
    sentAtMs: 100,
  }).ok, true);
  const firstApply = clientReplication.applyPendingReplication();
  assert.equal(firstApply.applied, 1);
  assert.equal(firstApply.ignored, 0);
  assert.equal(clientReplication.getReplicationStatus().lastAppliedTick, 5);
  assert.equal(clientReplication.getReplicationStatus().lastAppliedSequence, 10);

  assert.equal(clientReplication.ingestReplicationEnvelope({
    sessionId: 'session-runtime',
    replicationSequence: 0,
    authoritativeTick: 6,
    snapshotType: REPLICATION_SNAPSHOT_TYPES.DELTA,
    snapshot: {
      entities: [
        { id: 'npc-1', x: 15, y: 10 },
        { id: 'npc-3', x: 2, y: 9 },
      ],
      despawned: ['npc-2'],
    },
    sentAtMs: 130,
  }).ok, true);
  assert.equal(clientReplication.ingestReplicationEnvelope({
    sessionId: 'session-runtime',
    replicationSequence: 9,
    authoritativeTick: 5,
    snapshotType: REPLICATION_SNAPSHOT_TYPES.DELTA,
    snapshot: {
      entities: [{ id: 'npc-1', x: 13, y: 10 }],
      despawned: [],
    },
    sentAtMs: 120,
  }).ok, true);
  assert.equal(clientReplication.ingestReplicationEnvelope({
    sessionId: 'session-runtime',
    replicationSequence: 99,
    authoritativeTick: 4,
    snapshotType: REPLICATION_SNAPSHOT_TYPES.DELTA,
    snapshot: {
      entities: [{ id: 'npc-9', x: 1, y: 1 }],
      despawned: [],
    },
    sentAtMs: 119,
  }).ok, true);
  const secondApply = clientReplication.applyPendingReplication();
  assert.equal(secondApply.applied, 1);
  assert.equal(secondApply.ignored, 2);
  assert.equal(clientReplication.getReplicationStatus().lastAppliedTick, 6);
  assert.equal(clientReplication.getReplicationStatus().lastAppliedSequence, 0);
  assert.equal(clientReplication.getReplicationStatus().stateEntities, 2);
  const replicatedState = clientReplication.getReplicatedStateSnapshot();
  assert.equal(replicatedState.find((entity) => entity.id === 'npc-1').x, 15);
  assert.equal(replicatedState.some((entity) => entity.id === 'npc-2'), false);
  assert.equal(replicatedState.some((entity) => entity.id === 'npc-3'), true);
  const ignoreReasons = clientReplication.getIgnoredEnvelopes()
    .map((entry) => entry.reason)
    .filter((reason) => reason !== REPLICATION_IGNORE_REASONS.INVALID_ENVELOPE);
  assert.equal(ignoreReasons.includes(REPLICATION_IGNORE_REASONS.STALE_TICK), true);
  assert.equal(ignoreReasons.includes(REPLICATION_IGNORE_REASONS.STALE_SEQUENCE), true);
  const invalidEnvelopeResult = clientReplication.ingestReplicationEnvelope({
    sessionId: 'session-runtime',
    replicationSequence: 12,
    authoritativeTick: 7,
    snapshotType: 'unknown',
    snapshot: {
      entities: [],
    },
    sentAtMs: 140,
  });
  assert.equal(invalidEnvelopeResult.ok, false);
  assert.equal(
    invalidEnvelopeResult.code,
    REPLICATION_MESSAGE_REJECTION_CODES.SNAPSHOT_TYPE_INVALID,
  );

  // Level 12.4: one minimal playable multiplayer validation slice.
  const playableSessionId = 'session-playable-minimal';
  const [playableHostTransport, playableClientTransport] = LoopbackTransport.createLinkedPair(
    'host-playable',
    'client-playable',
  );
  const playableHandshake = new HandshakeSimulator({
    sessionId: playableSessionId,
    hostId: 'host-playable',
    clientId: 'client-playable',
    hostTransport: playableHostTransport,
    clientTransport: playableClientTransport,
  });
  assert.equal(playableHandshake.begin({ token: 'playable-token' }), true);
  const playableHandshakeState = playableHandshake.update();
  assert.equal(playableHandshakeState.handshakeComplete, true);
  assert.equal(playableHandshakeState.host.state, SESSION_STATES.ACTIVE);
  assert.equal(playableHandshakeState.client.state, SESSION_STATES.ACTIVE);

  const playableServer = new AuthoritativeServerRuntime({
    sessionId: playableSessionId,
    tickRateHz: 20,
  });
  const playableServerStarted = playableServer.start();
  assert.equal(playableServerStarted.runtimePhase, SERVER_RUNTIME_PHASES.RUNNING);

  const playableClient = new ClientReplicationApplicationLayer({
    sessionId: playableSessionId,
    reconciliationStrategy: new ClientReconciliationStrategy(),
  });
  const playableStateReplication = new StateReplication();
  let authoritativePlayableEntities = [{ id: 'player-1', x: 0, y: 0 }];

  const playableInputAccepted = playableServer.ingestClientInput({
    sessionId: playableSessionId,
    clientId: 'client-playable',
    sequence: 0,
    inputType: 'move',
    payload: { dx: 3, dy: 0 },
    sentAtMs: 1,
  });
  assert.equal(playableInputAccepted.ok, true);

  playableServer.step(0.05);
  const playableInputs = playableServer.drainAcceptedInputs();
  assert.equal(playableInputs.length, 1);
  authoritativePlayableEntities = authoritativePlayableEntities.map((entity) => ({
    ...entity,
    x: entity.id === 'player-1'
      ? entity.x + (playableInputs[0].payload.dx ?? 0)
      : entity.x,
    y: entity.id === 'player-1'
      ? entity.y + (playableInputs[0].payload.dy ?? 0)
      : entity.y,
  }));

  const playableSnapshot = playableStateReplication.createSnapshot(authoritativePlayableEntities, {
    tick: playableServer.getSnapshot().authoritativeTick,
  });
  assert.equal(playableClient.ingestReplicationEnvelope({
    sessionId: playableSessionId,
    replicationSequence: 0,
    authoritativeTick: playableSnapshot.tick,
    snapshotType: REPLICATION_SNAPSHOT_TYPES.FULL,
    snapshot: {
      entities: playableSnapshot.entities,
      despawned: playableSnapshot.despawned,
    },
    sentAtMs: 5,
  }).ok, true);
  const playableApplyResult = playableClient.applyPendingReplication();
  assert.equal(playableApplyResult.applied, 1);
  assert.equal(playableApplyResult.ignored, 0);
  assert.equal(
    playableClient.getReplicatedStateSnapshot().find((entity) => entity.id === 'player-1').x,
    authoritativePlayableEntities[0].x,
  );

  const playableDisconnectState = playableHandshake.disconnect('playable-cleanup');
  assert.equal(playableDisconnectState.host.state, SESSION_STATES.DISCONNECTED);
  assert.equal(playableDisconnectState.client.state, SESSION_STATES.DISCONNECTED);
  const playableServerStopped = playableServer.stop('playable-cleanup');
  assert.equal(playableServerStopped.runtimePhase, SERVER_RUNTIME_PHASES.STOPPED);
  assert.equal(playableServer.drainAcceptedInputs().length, 0);
  assert.equal(playableClient.getReplicationStatus().pendingEnvelopes, 0);

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
