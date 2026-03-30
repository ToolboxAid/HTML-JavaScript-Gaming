/*
Toolbox Aid
David Quesenberry
03/30/2026
WorldGameStateAuthoritativeHandoff.test.mjs
*/
import assert from 'node:assert/strict';
import {
  WORLD_GAME_STATE_EVENT_TYPES,
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
  const disposedOwners = [];
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
    disposeOwner(ownerId) {
      disposedOwners.push(ownerId);
    },
    getDisposedOwners() {
      return disposedOwners.slice();
    }
  };
}

export function run() {
  const defaultGateSystem = createWorldGameStateSystem();
  assert.equal(
    defaultGateSystem.getFeatureGates()[WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS],
    false
  );

  const passiveComparisonSystem = createWorldGameStateSystem({
    passiveMode: true,
    featureGates: {
      [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS]: true
    }
  });

  const passiveResult = passiveComparisonSystem.requestTransition('updateObjectiveProgress', {
    objectiveId: 'obj-passive',
    currentValue: 2,
    targetValue: 5,
    isComplete: false
  });
  assert.equal(passiveResult.ok, true);
  assert.equal(passiveResult.applied, false);
  assert.equal(passiveResult.code, 'PASSIVE_COMPARISON_ONLY');
  assert.equal(passiveResult.eventType, WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED);
  assert.equal(typeof passiveResult.comparison, 'object');
  const passiveSnapshot = passiveComparisonSystem.select('selectObjectiveSnapshot');
  assert.equal(passiveSnapshot.byId['obj-passive'], undefined);

  const gateOffSystem = createWorldGameStateSystem({
    passiveMode: false,
    featureGates: {
      [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS]: false
    }
  });
  const gateOffResult = gateOffSystem.requestTransition('updateObjectiveProgress', {
    objectiveId: 'obj-gate-off',
    currentValue: 1,
    targetValue: 3
  });
  assert.equal(gateOffResult.ok, true);
  assert.equal(gateOffResult.applied, false);
  assert.equal(gateOffResult.code, 'PASSIVE_COMPARISON_ONLY');
  assert.equal(gateOffSystem.select('selectObjectiveSnapshot').byId['obj-gate-off'], undefined);

  const authoritativeSystem = createWorldGameStateSystem({
    passiveMode: false,
    now: () => 7000,
    featureGates: {
      [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS]: true
    }
  });
  assert.equal(
    authoritativeSystem.getFeatureGates()[WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS],
    true
  );
  const authoritativeResult = authoritativeSystem.requestTransition('updateObjectiveProgress', {
    objectiveId: 'obj-auth',
    currentValue: 3,
    targetValue: 3,
    isComplete: true
  });
  assert.equal(authoritativeResult.ok, true);
  assert.equal(authoritativeResult.applied, true);
  assert.equal(authoritativeResult.code, 'APPLIED_AUTHORITATIVE_OBJECTIVE_PROGRESS');
  assert.equal(authoritativeResult.eventType, WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED);
  const objectiveSnapshot = authoritativeSystem.select('selectObjectiveSnapshot');
  assert.equal(objectiveSnapshot.byId['obj-auth'].updatedAtMs, 7000);
  assert.equal(objectiveSnapshot.summary.total, 1);
  assert.equal(objectiveSnapshot.summary.completed, 1);
  assert.throws(() => {
    objectiveSnapshot.byId['obj-auth'].currentValue = 999;
  }, /TypeError/);

  const rejectedPatchResult = authoritativeSystem.applyExternalSnapshotPatch({
    worldState: {
      objectives: {
        byId: {
          'obj-auth': {
            objectiveId: 'obj-auth',
            currentValue: 999
          }
        }
      }
    }
  });
  assert.equal(rejectedPatchResult.ok, false);
  assert.equal(rejectedPatchResult.reason, 'OBJECTIVE_AUTHORITATIVE_SLICE_REQUIRES_TRANSITION');
  const objectiveSnapshotAfterRejectedPatch = authoritativeSystem.select('selectObjectiveSnapshot');
  assert.equal(objectiveSnapshotAfterRejectedPatch.byId['obj-auth'].currentValue, 3);

  const pipeline = createEventPipeline();
  const integrationApi = createIntegrationApi(pipeline);
  const registration = registerWorldGameStateSystem({
    integrationApi,
    stateSystemOptions: {
      passiveMode: false,
      now: () => 8000,
      featureGates: {
        [WORLD_GAME_STATE_FEATURE_GATES.AUTHORITATIVE_OBJECTIVE_PROGRESS]: true
      }
    }
  });
  assert.equal(registration.ok, true);
  assert.equal(registration.consumerAttached, true);

  const realPathResult = registration.getStateApi().requestTransition('updateObjectiveProgress', {
    objectiveId: 'obj-real-path',
    currentValue: 4,
    targetValue: 6,
    isComplete: false
  });
  assert.equal(realPathResult.ok, true);
  assert.equal(realPathResult.applied, true);
  assert.equal(realPathResult.eventPublished, true);

  const mirroredSnapshot = registration.getConsumerApi().getLastMirror();
  assert.equal(mirroredSnapshot.byId['obj-real-path'].currentValue, 4);
  assert.equal(mirroredSnapshot.byId['obj-real-path'].updatedAtMs, 8000);
  assert.throws(() => {
    mirroredSnapshot.summary.total = 999;
  }, /TypeError/);

  registration.dispose();
  assert.equal(integrationApi.getDisposedOwners().length >= 1, true);
}
