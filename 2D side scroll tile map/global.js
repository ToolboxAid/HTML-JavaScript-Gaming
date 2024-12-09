// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// global.js

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
  width: 896, // Game area width (256 * 4)
  height: 960, // Game area height (240 * 4)
  scale: 0.5,
  backgroundColor: "#222222",

  fullscreenText: 'Click game to enter fullscreen',
  fullscreenFont: '40px Arial',
  fullscreenColor: 'yellow',
  fullscreenX: 180, // X position for fullscreen text
  fullscreenY: 930,//675, // Y position for fullscreen text
};

export const playerSelect = {
  maxPlayers: 2,
  lives: 3,
  
  fillStyle: "yellow",
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
  playerColor: 'white',
};

// non type="module" in HTML
// Set global canvas variables for ../scripts
window.gameAreaWidth = canvasConfig.width;
window.gameAreaHeight = canvasConfig.height;
window.gameScaleWindow = canvasConfig.scale;
window.backgroundColor = canvasConfig.backgroundColor;

window.pixelSize = spriteConfig.pixelSize

window.fullscreenText = canvasConfig.fullscreenText;
window.fullscreenFont = canvasConfig.fullscreenFont;
window.fullscreenColor = canvasConfig.fullscreenColor;
window.fullscreenX = canvasConfig.fullscreenX;
window.fullscreenY = canvasConfig.fullscreenY;

window.borderColor = "red";
window.borderSize = 5;

// Configuration for FPS display
window.fpsShow = true;
window.fpsColor = "red";
window.fpsSize = "30px";
window.fpsX = 404;
window.fpsY = 855;