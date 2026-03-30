/*
Toolbox Aid
David Quesenberry
03/30/2026
selectors.js
*/

const SELECTOR_REGISTRY = Object.freeze({
  selectWorldState: (snapshot) => snapshot.worldState,
  selectGameState: (snapshot) => snapshot.gameState,
  selectCurrentMode: (snapshot) => snapshot.gameState.mode,
  selectCurrentPhase: (snapshot) => snapshot.gameState.phase,
  selectWaveProgress: (snapshot) => ({
    wave: snapshot.worldState.progression.wave,
    round: snapshot.worldState.progression.round,
    level: snapshot.worldState.progression.level
  }),
  selectIsRunComplete: (snapshot) => Boolean(
    snapshot.worldState.outcomes.complete || snapshot.worldState.outcomes.status === 'complete'
  ),
  selectScoreSnapshot: (snapshot) => snapshot.worldState.scores,
  selectObjectiveSnapshot: (snapshot) => snapshot.worldState.objectives,
  selectWorldFlag: (snapshot, flagName) => Boolean(snapshot.worldState.flags[String(flagName || '')])
});

function createSelectorRegistry() {
  return { ...SELECTOR_REGISTRY };
}

export { createSelectorRegistry };
