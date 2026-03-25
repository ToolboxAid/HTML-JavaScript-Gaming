/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyConfig.js
*/
const AITargetDummyConfig = Object.freeze({
  pursueEnterDist: 250,
  pursueExitDist: 300,
  evadeEnterDist: 86,
  evadeExitDist: 122,
  lostTargetTimeoutMs: 650,
  minStateMs: 320,
  stateCooldownMs: 180,
  maxSpeedByState: Object.freeze({
    idle: 0,
    patrol: 120,
    pursue: 188,
    evade: 210,
  }),
  dampingByState: Object.freeze({
    idle: 0.22,
    patrol: 0.16,
    pursue: 0.12,
    evade: 0.1,
  }),
  maxTurnRateRadPerSec: 5.4,
  accelPerSec: 360,
  patrolWaypointTolerance: 20,
});

export default AITargetDummyConfig;
