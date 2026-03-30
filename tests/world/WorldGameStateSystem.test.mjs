/*
Toolbox Aid
David Quesenberry
03/30/2026
WorldGameStateSystem.test.mjs
*/
import assert from 'node:assert/strict';
import {
  WORLD_GAME_STATE_EVENT_TYPES,
  WORLD_GAME_STATE_SYSTEM_ID,
  createInitialWorldGameState,
  createObjectiveProgressMirrorConsumer,
  createStateContractEventEnvelope,
  createWorldGameStateSystem,
  registerWorldGameStateSystem
} from '../../samples/shared/worldGameStateSystem.js';

function createLocalEventPipeline() {
  const listenersByType = new Map();
  return {
    subscribe(eventType, handler) {
      const normalized = String(eventType || '');
      if (!listenersByType.has(normalized)) listenersByType.set(normalized, new Set());
      const listeners = listenersByType.get(normalized);
      listeners.add(handler);
      return () => {
        listeners.delete(handler);
        if (!listeners.size) listenersByType.delete(normalized);
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

function createMockIntegrationApi() {
  const systems = new Map();
  const pipeline = createLocalEventPipeline();
  const disposedOwners = [];
  return {
    registerSystem(contract) {
      systems.set(contract.systemId, contract.publicApi);
      return true;
    },
    unregisterSystem(systemId) {
      return systems.delete(systemId);
    },
    getPublicApi(systemId) {
      return systems.get(systemId) || null;
    },
    publish(eventType, payload) {
      pipeline.publish(eventType, payload);
      return true;
    },
    runComposition(_ownerId, compose) {
      compose({
        subscribe: pipeline.subscribe,
        getPublicApi: (systemId) => systems.get(systemId) || null
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
  const initial = createInitialWorldGameState();
  assert.equal(initial.contractVersion, 1);
  assert.equal(initial.gameState.mode, 'boot');
  assert.equal(initial.worldState.progression.wave, 0);

  const published = [];
  const stateSystem = createWorldGameStateSystem({
    publishEvent(eventType, envelope) {
      published.push({ eventType, envelope });
      return true;
    }
  });

  assert.equal(stateSystem.getTransitionNames().includes('transitionGameMode'), true);
  assert.equal(stateSystem.getSelectorNames().includes('selectObjectiveSnapshot'), true);

  const transitionResult = stateSystem.requestTransition('transitionPhase', { nextPhase: 'active' });
  assert.equal(transitionResult.ok, true);
  assert.equal(transitionResult.applied, false);
  assert.equal(transitionResult.passiveMode, true);
  assert.equal(transitionResult.code, 'PASSIVE_MODE_NOOP');
  assert.equal(transitionResult.eventType, WORLD_GAME_STATE_EVENT_TYPES.GAME_PHASE_CHANGED);

  const rejectedResult = stateSystem.requestTransition('missingTransition', {});
  assert.equal(rejectedResult.ok, false);
  assert.equal(rejectedResult.code, 'UNKNOWN_TRANSITION');
  assert.equal(rejectedResult.eventType, WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_REJECTED);

  const patchResult = stateSystem.applyExternalSnapshotPatch({
    worldState: {
      objectives: {
        byId: {
          objA: {
            objectiveId: 'objA',
            currentValue: 2,
            targetValue: 5,
            isComplete: false
          }
        },
        summary: {
          total: 1,
          completed: 0,
          active: 1
        }
      }
    }
  });
  assert.equal(patchResult.ok, true);
  assert.equal(patchResult.reason, 'PATCH_APPLIED');

  const objectiveSnapshot = stateSystem.select('selectObjectiveSnapshot');
  assert.equal(objectiveSnapshot.byId.objA.currentValue, 2);
  assert.throws(() => {
    objectiveSnapshot.summary.total = 99;
  }, /TypeError/);

  const readonly = stateSystem.getReadonlyView();
  assert.equal(readonly.gameState.phase, 'intro');
  assert.throws(() => {
    readonly.gameState.phase = 'mutated';
  }, /TypeError/);

  assert.equal(published.length >= 2, true);

  const localPipeline = createLocalEventPipeline();
  const consumer = createObjectiveProgressMirrorConsumer();
  const attached = consumer.attach({
    subscribe: localPipeline.subscribe,
    getStateApi: () => stateSystem.getPublicApi()
  });
  assert.equal(attached, true);

  localPipeline.publish(WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED, {
    eventType: WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED
  });

  const mirror = consumer.getLastMirror();
  assert.equal(mirror.byId.objA.objectiveId, 'objA');
  assert.throws(() => {
    mirror.byId.objA.currentValue = 99;
  }, /TypeError/);
  consumer.detach();

  const envelope = createStateContractEventEnvelope({
    eventType: WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
    correlationId: 'corr-1',
    payload: { transitionName: 'transitionPhase' },
    producer: WORLD_GAME_STATE_SYSTEM_ID,
    now: () => 1234
  });
  assert.equal(envelope.eventVersion, 1);
  assert.equal(envelope.timestampMs, 1234);
  assert.equal(envelope.producer, WORLD_GAME_STATE_SYSTEM_ID);

  const integrationApi = createMockIntegrationApi();
  const registration = registerWorldGameStateSystem({ integrationApi });
  assert.equal(registration.ok, true);
  assert.equal(registration.systemRegistered, true);
  assert.equal(registration.consumerAttached, true);
  assert.equal(typeof registration.getStateApi().requestTransition, 'function');

  registration.stateSystem.applyExternalSnapshotPatch({
    worldState: {
      objectives: {
        byId: {
          objB: {
            objectiveId: 'objB',
            currentValue: 3,
            targetValue: 3,
            isComplete: true
          }
        },
        summary: {
          total: 1,
          completed: 1,
          active: 0
        }
      }
    }
  });
  integrationApi.publish(WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED, {
    eventType: WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED
  });
  const mirroredFromRegistration = registration.getConsumerApi().getLastMirror();
  assert.equal(mirroredFromRegistration.byId.objB.isComplete, true);

  registration.dispose();
  assert.equal(integrationApi.getDisposedOwners().length >= 1, true);
  assert.equal(integrationApi.getPublicApi(WORLD_GAME_STATE_SYSTEM_ID), null);
}
