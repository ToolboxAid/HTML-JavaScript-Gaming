/*
Toolbox Aid
David Quesenberry
03/30/2026
WorldGameStateAuthoritativeScore.test.mjs
*/
import assert from 'node:assert/strict';
import {
  WORLD_GAME_STATE_FEATURE_GATES,
  createWorldGameStateSystem,
  registerWorldGameStateSystem
} from '../../src/advanced/state/index.js';

function createEventPipeline() {
  const listenersByType = new Map();
  return {
    subscribe(eventType, handler) {
      const normalizedType = String(eventType || '');
      if (!listenersByType.has(normalizedType)) listenersByType.set(normalizedType, new Set());
      const listeners = listenersByType.get(normalizedType);
      listeners.add(handler);
      return () => {
        listeners.delete(handler);
        if (!listeners.size) listenersByType.delete(normalizedType);
      };
    },
    publish(eventType, payload) {
      const listeners = listenersByType.get(String(eventType || ''));
      if (!listeners || !listeners.size) return 0;
      const snapshot = Array.from(listeners);
      for (let i = 0; i < snapshot.length; i += 1) {
        snapshot[i](payload);
      }
      return snapshot.length;
    }
  };
}

function createIntegrationApi(pipeline) {
  const systemsById = new Map();
  return {
    registerSystem(contract) {
      systemsById.set(contract.systemId, contract.publicApi);
      return true;
    },
    unregisterSystem(systemId) {
      return systemsById.delete(systemId);
    },
    getPublicApi(systemId) {
      return systemsById.get(systemId) || null;
    },
    publish(eventType, payload) {
      pipeline.publish(eventType, payload);
      return true;
    },
    runComposition(_ownerId, compose) {
      compose({
        subscribe: pipeline.subscribe,
        getPublicApi: (systemId) => systemsById.get(systemId) || null
      });
      return true;
    },
    disposeOwner() {}
  };
}

export function run() {
  const defaultGateSystem = createWorldGameStateSystem();
  assert.equal(
    defaultGateSystem.getFeatureGates()[WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE],
    false
  );

  const gateOffSystem = createWorldGameStateSystem({
    passiveMode: false,
    featureGates: {
      [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE]: false
    }
  });
  const gateOffResult = gateOffSystem.requestTransition('applyScoreDelta', {
    delta: 10,
    rewardDelta: 2
  });
  assert.equal(gateOffResult.ok, true);
  assert.equal(gateOffResult.applied, false);
  assert.equal(gateOffResult.code, 'PASSIVE_COMPARISON_ONLY');
  assert.equal(gateOffSystem.select('selectScoreSnapshot').total, 0);

  const passiveComparisonSystem = createWorldGameStateSystem({
    passiveMode: true,
    featureGates: {
      [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE]: true
    }
  });
  const passiveResult = passiveComparisonSystem.requestTransition('applyScoreDelta', {
    delta: 5
  });
  assert.equal(passiveResult.ok, true);
  assert.equal(passiveResult.applied, false);
  assert.equal(passiveResult.code, 'PASSIVE_COMPARISON_ONLY');
  assert.equal(passiveComparisonSystem.select('selectScoreSnapshot').total, 0);

  const authoritativeSystem = createWorldGameStateSystem({
    passiveMode: false,
    featureGates: {
      [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE]: true
    }
  });
  const authoritativeResult = authoritativeSystem.requestTransition('applyScoreDelta', {
    delta: 15,
    rewardDelta: 4,
    rank: 'S'
  });
  assert.equal(authoritativeResult.ok, true);
  assert.equal(authoritativeResult.applied, true);
  assert.equal(authoritativeResult.code, 'APPLIED_AUTHORITATIVE_SCORE');

  const scoreSnapshot = authoritativeSystem.select('selectScoreSnapshot');
  assert.equal(scoreSnapshot.total, 15);
  assert.equal(scoreSnapshot.rewardPoints, 4);
  assert.equal(scoreSnapshot.rank, 'S');
  assert.throws(() => {
    scoreSnapshot.total = 999;
  }, /TypeError/);

  const rejectedPatchResult = authoritativeSystem.applyExternalSnapshotPatch({
    worldState: {
      scores: {
        total: 999
      }
    }
  });
  assert.equal(rejectedPatchResult.ok, false);
  assert.equal(rejectedPatchResult.reason, 'SCORE_AUTHORITATIVE_SLICE_REQUIRES_TRANSITION');
  assert.equal(authoritativeSystem.select('selectScoreSnapshot').total, 15);

  const pipeline = createEventPipeline();
  const integrationApi = createIntegrationApi(pipeline);
  const registration = registerWorldGameStateSystem({
    integrationApi,
    stateSystemOptions: {
      passiveMode: false,
      featureGates: {
        [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_SCORE]: true
      }
    }
  });
  assert.equal(registration.ok, true);
  assert.equal(registration.consumerId, 'objectiveProgressMirrorConsumer');
  assert.equal(registration.consumerAttached, true);
  assert.equal(typeof registration.getConsumerApi().getLastMirror, 'function');

  const api = registration.getStateApi();
  const registeredResult = api.requestTransition('applyScoreDelta', { delta: 7 });
  assert.equal(registeredResult.ok, true);
  assert.equal(registeredResult.applied, true);
  assert.equal(api.select('selectScoreSnapshot').total, 7);

  registration.dispose();
}
