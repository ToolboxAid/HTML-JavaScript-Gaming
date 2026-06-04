/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIConfig.js
*/
const PacmanFullAIConfig = Object.freeze({
  tileSize: 32,
  playerSpeed: 156,
  ghostSpeedNormal: 146,
  ghostSpeedFrightened: 112,
  ghostSpeedTunnel: 92,
  ghostSpeedEaten: 208,
  frightenedDurationMs: 6000,
  frightenedFlashMs: 1800,
  modeScheduleMs: Object.freeze([
    { mode: 'scatter', durationMs: 7000 },
    { mode: 'chase', durationMs: 20000 },
    { mode: 'scatter', durationMs: 7000 },
    { mode: 'chase', durationMs: 20000 },
    { mode: 'scatter', durationMs: 5000 },
    { mode: 'chase', durationMs: 20000 },
    { mode: 'scatter', durationMs: 5000 },
  ]),
  tieBreakOrder: Object.freeze(['up', 'left', 'down', 'right']),
  ghostRelease: Object.freeze({
    pinkyMs: 3500,
    inkyPellets: 30,
    clydePellets: 60,
  }),
  spawn: Object.freeze({
    player: Object.freeze({ x: 9, y: 15 }),
    blinky: Object.freeze({ x: 9, y: 9 }),
    pinky: Object.freeze({ x: 9, y: 10 }),
    inky: Object.freeze({ x: 9, y: 11 }),
    clyde: Object.freeze({ x: 9, y: 12 }),
    houseDoor: Object.freeze({ x: 9, y: 8 }),
  }),
  scatterTargets: Object.freeze({
    blinky: Object.freeze({ x: 16, y: 0 }),
    pinky: Object.freeze({ x: 0, y: 0 }),
    inky: Object.freeze({ x: 16, y: 18 }),
    clyde: Object.freeze({ x: 0, y: 18 }),
  }),
});

export default PacmanFullAIConfig;
