/*
Toolbox Aid
David Quesenberry
03/30/2026
constants.js
*/

const WORLD_GAME_STATE_SYSTEM_ID = 'worldGameStateSystem';

const WORLD_GAME_STATE_EVENT_TYPES = Object.freeze({
  TRANSITION_APPLIED: 'worldState.transition.applied',
  TRANSITION_REJECTED: 'worldState.transition.rejected',
  GAME_PHASE_CHANGED: 'gameState.phase.changed',
  GAME_MODE_CHANGED: 'gameState.mode.changed',
  OBJECTIVE_SNAPSHOT_UPDATED: 'objective.snapshot.updated'
});

const WORLD_GAME_STATE_TRANSITION_NAMES = Object.freeze([
  'transitionGameMode',
  'transitionPhase',
  'advanceWave',
  'applyScoreDelta',
  'updateObjectiveProgress',
  'setWorldFlag',
  'resolveRunOutcome'
]);

const WORLD_GAME_STATE_FEATURE_GATES = Object.freeze({
  AUTHORITATIVE_OBJECTIVE_PROGRESS: 'authoritativeObjectiveProgress',
  AUTHORITATIVE_SCORE: 'authoritativeScore'
});

export {
  WORLD_GAME_STATE_SYSTEM_ID,
  WORLD_GAME_STATE_EVENT_TYPES,
  WORLD_GAME_STATE_TRANSITION_NAMES,
  WORLD_GAME_STATE_FEATURE_GATES
};
