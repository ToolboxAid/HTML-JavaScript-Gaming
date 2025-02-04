// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
  width: 600, // Game area width
  height: 600, // Game area height
  scale: 0.5,
  backgroundColor: "#222222",

  fullscreenText: 'Click game to enter fullscreen',
  fullscreenFont: '30px Arial',
  fullscreenColor: 'yellow',
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
  size: 12,
  font: "monospace",
  colorLow: "green",
  colorMed: "yellow",
  colorHigh: "red",
  backgroundColor: "#AAAAAABB",

  x: 10,
  y: 140,
}