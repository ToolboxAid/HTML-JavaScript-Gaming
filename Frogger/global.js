// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
  //224x256
  width: 896, // Game area width
  height: 1024, // Game area height
  scale: 0.35,
  backgroundColor: "#333333",
  borderColor: "yellow",
  borderSize: 1,
};

export const fullscreenConfig = {
  color: 'yellow',
  font: '40px Arial',
  text: 'Click here to enter fullscreen',
  x: 230,
  y: 790
};

export const performanceConfig = {
  show: false,
  size: 30,
  font: "monospace",
  colorLow: "green",
  colorMed: "yellow",
  colorHigh: "red",
  backgroundColor: "#AAAAAABB",

  x: 700,
  y: 15,
}

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

