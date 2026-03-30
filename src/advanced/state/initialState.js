/*
Toolbox Aid
David Quesenberry
03/30/2026
initialState.js
*/

import { isPlainObject, mergeDeep } from './utils.js';

function createInitialWorldGameState(initialPatch = {}) {
  const baseline = {
    contractVersion: 1,
    worldState: {
      session: {
        runId: null,
        status: 'idle',
        startedAtMs: null,
        lastUpdatedMs: null
      },
      progression: {
        wave: 0,
        round: 0,
        level: 1
      },
      outcomes: {
        status: 'in_progress',
        win: false,
        loss: false,
        pause: false,
        complete: false
      },
      scores: {
        total: 0,
        rewardPoints: 0,
        rank: null
      },
      objectives: {
        summary: {
          total: 0,
          completed: 0,
          active: 0
        },
        byId: {}
      },
      flags: {}
    },
    gameState: {
      mode: 'boot',
      phase: 'intro',
      subsystems: {},
      timers: {},
      meta: {}
    }
  };

  if (!isPlainObject(initialPatch)) return baseline;
  return mergeDeep(baseline, initialPatch);
}

export { createInitialWorldGameState };
