/*
Toolbox Aid
David Quesenberry
03/24/2026
PongModeConfig.js
*/
const MODES = [
  {
    key: 'tennis',
    name: 'Tennis',
    description: 'Classic two-paddle Pong with open ends and first to eleven.',
    twoPaddles: true,
    targetScore: 11,
    winByTwo: true,
    leftPaddleHeight: 112,
    rightPaddleHeight: 112,
    startSpeed: 365,
    maxSpeed: 880,
    speedStep: 18,
    goalHeight: 0,
    wallInset: 0,
    rightWallClosed: false,
    leftWallClosed: false,
    soloScoring: false,
  },
  {
    key: 'hockey',
    name: 'Hockey',
    description: 'Enclosed rink with goal slots cut into each end wall.',
    twoPaddles: true,
    targetScore: 7,
    winByTwo: false,
    leftPaddleHeight: 92,
    rightPaddleHeight: 92,
    startSpeed: 390,
    maxSpeed: 940,
    speedStep: 20,
    goalHeight: 176,
    wallInset: 14,
    rightWallClosed: true,
    leftWallClosed: true,
    soloScoring: false,
  },
  {
    key: 'handball',
    name: 'Handball',
    description: 'Solo wall-return mode focused on keeping the rally alive.',
    twoPaddles: false,
    targetScore: 25,
    winByTwo: false,
    leftPaddleHeight: 118,
    rightPaddleHeight: 0,
    startSpeed: 380,
    maxSpeed: 900,
    speedStep: 18,
    goalHeight: 0,
    wallInset: 0,
    rightWallClosed: true,
    leftWallClosed: false,
    soloScoring: true,
  },
  {
    key: 'jai-alai',
    name: 'Jai-Alai',
    description: 'Fast solo wall game with hotter rebounds and higher speed ceiling.',
    twoPaddles: false,
    targetScore: 35,
    winByTwo: false,
    leftPaddleHeight: 108,
    rightPaddleHeight: 0,
    startSpeed: 430,
    maxSpeed: 1080,
    speedStep: 28,
    goalHeight: 0,
    wallInset: 0,
    rightWallClosed: true,
    leftWallClosed: false,
    soloScoring: true,
  },
];

export function getPongModes() {
  return MODES.map((mode) => ({ ...mode }));
}

export function getPongMode(index = 0) {
  const modes = getPongModes();
  const safeIndex = ((index % modes.length) + modes.length) % modes.length;
  return modes[safeIndex];
}
