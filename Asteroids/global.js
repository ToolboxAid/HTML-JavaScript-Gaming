// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Set global variables for local classes (same directory)
export const canvasConfig = {
  width: 1024, // Game area width
  height: 768, // Game area height
  scale: 0.5,
  backgroundColor: "#333333",
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

  x: 20,
  y: 700,
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
