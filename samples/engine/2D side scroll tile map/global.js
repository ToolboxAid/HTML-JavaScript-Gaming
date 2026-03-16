// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// global.js

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
  game: "2D Tile Map",
  width: 640, // Game area width
  height: 480, // Game area height
  scale: 0.5,
  backgroundColor: "#1f0b57",
  borderColor: "#ed9700",
  borderSize: 15,
};

export const fullscreenConfig = {
  color: '#ed9700',
  font: '28px Segoe UI',
  text: 'Click the canvas to toggle fullscreen.',
  x: 230,
  y: 790
};

export const performanceConfig = {
  show: true,
  size: 10,
  font: "monospace",
  colorLow: "#7bd389",
  colorMed: "#ed9700",
  colorHigh: "#ff5f57",
  backgroundColor: "#AAAAAABB",

  x: 525,
  y: 10,
}

export const playerSelect = {
  maxPlayers: 2,
  lives: 3,

  color: "#ed9700",
  font: "25px Segoe UI",
  title: "Select Player(s)",

  x: 250,
  y: 300,
  spacing: 40
}

export const spriteConfig = {
  pixelSize: 2.0,

  playerLives: 3,
  playerBonusScore: 1500,
  playerColor: 'white',
}
