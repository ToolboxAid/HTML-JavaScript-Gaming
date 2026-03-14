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
  backgroundColor: "#222222",
  borderColor: "white",
  borderSize: 15,
};

export const fullscreenConfig = {
  color: 'yellow',
  font: '40px Arial',
  text: 'Click here to enter fullscreen',
  x: 230,
  y: 790
};

export const performanceConfig = {
  show: true,
  size: 10,
  font: "monospace",
  colorLow: "green",
  colorMed: "yellow",
  colorHigh: "red",
  backgroundColor: "#AAAAAABB",

  x: 525,
  y: 10,
}

export const playerSelect = {
  maxPlayers: 2,
  lives: 3,

  fillStyle: "pink",
  font: "25px Arial",
  fillText: "Select Player(s)",

  optionBaseX: 250,
  optionBaseY: 300,
  optionSpacing: 40
}

export const spriteConfig = {
  pixelSize: 2.0,

  playerLives: 3,
  playerBonusScore: 1500,
  playerColor: 'white',
}
