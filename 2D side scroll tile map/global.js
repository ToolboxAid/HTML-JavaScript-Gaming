// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// global.js

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
  game: "2D Tile Map",
  width: 480, // Game area width
  height: 480, // Game area height
  scale: 1.0,
  backgroundColor: "#222222",

  fullscreenText: 'Click game to enter fullscreen',
  fullscreenFont: '10px Arial',
  fullscreenColor: 'pink',
  fullscreenX: 180, // X position for fullscreen text
  fullscreenY: 230 //675, // Y position for fullscreen text
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
  pixelSize: 3.5,

  playerLives: 3,
  playerBonusScore: 1500,
  playerColor: 'pink',
}

// non type="module" in HTML
// Set global canvas variables for ../scripts
window.game = canvasConfig.game;

window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.gameScaleWindow = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;

window.pixelSize = spriteConfig.pixelSize;

window.fullscreenText = canvasConfig.fullscreenText;
window.fullscreenFont = canvasConfig.fullscreenFont;
window.fullscreenColor = canvasConfig.fullscreenColor;
window.fullscreenX = canvasConfig.fullscreenX;
window.fullscreenY = canvasConfig.fullscreenY;

window.borderColor = "pink";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = true;
window.fpsColor = "pink";
window.fpsSize = "10px";
window.fpsX = 40;
window.fpsY = 55;