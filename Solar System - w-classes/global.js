// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

// Set global variables for local classes (same directory)
// Configuration for the canvas
export const canvasConfig = {
  width: 1024, // Game area width
  height: 768, // Game area height
  scale: 0.35,
  backgroundColor: "#000000",
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
  // Configuration for FPS display
  show: true,
  size: 30,
  font: "monospace",
  colorLow: "green",
  colorMed: "yellow",
  colorHigh: "red",
  backgroundColor: "#AAAAAABB",

  x: 20,
  y: 40,
}

export const solarSystemConfig = {
  sunRadius: 30,
}