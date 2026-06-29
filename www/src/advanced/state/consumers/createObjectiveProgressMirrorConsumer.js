/*
Toolbox Aid
David Quesenberry
03/30/2026
createObjectiveProgressMirrorConsumer.js
*/

import { WORLD_GAME_STATE_EVENT_TYPES } from '../constants.js';
import { cloneDeep, createReadonlyClone } from '../utils.js';

function createObjectiveProgressMirrorConsumer(options = {}) {
  const consumerId = String(options.id || 'objectiveProgressMirrorConsumer');
  const approvedInputs = [
    WORLD_GAME_STATE_EVENT_TYPES.TRANSITION_APPLIED,
    WORLD_GAME_STATE_EVENT_TYPES.OBJECTIVE_SNAPSHOT_UPDATED
  ];

  let unsubscribers = [];
  let getStateApiRef = null;
  let lastMirror = null;

  function updateMirrorFromSelectors() {
    if (typeof getStateApiRef !== 'function') return;
    const stateApi = getStateApiRef();
    if (!stateApi || typeof stateApi.select !== 'function') return;
    const snapshot = stateApi.select('selectObjectiveSnapshot');
    lastMirror = cloneDeep(snapshot || null);
  }

  function detach() {
    for (let i = 0; i < unsubscribers.length; i += 1) {
      unsubscribers[i]();
    }
    unsubscribers = [];
  }

  function attach({ subscribe, getStateApi } = {}) {
    detach();
    getStateApiRef = typeof getStateApi === 'function' ? getStateApi : null;
    if (typeof subscribe !== 'function') return false;

    for (let i = 0; i < approvedInputs.length; i += 1) {
      const eventType = approvedInputs[i];
      const unsubscribe = subscribe(eventType, () => {
        updateMirrorFromSelectors();
      });
      if (typeof unsubscribe === 'function') {
        unsubscribers.push(unsubscribe);
      }
    }

    updateMirrorFromSelectors();
    return true;
  }

  function getLastMirror() {
    if (lastMirror === null) return null;
    return createReadonlyClone(lastMirror);
  }

  function getId() {
    return consumerId;
  }

  return {
    getId,
    attach,
    detach,
    getLastMirror
  };
}

export { createObjectiveProgressMirrorConsumer };
