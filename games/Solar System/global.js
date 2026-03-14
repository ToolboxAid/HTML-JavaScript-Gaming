// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

export const canvasConfig = {
  width: 1024,
  height: 768,
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
  show: true,
  size: 18,
  font: "monospace",
  colorLow: "green",
  colorMed: "yellow",
  colorHigh: "red",
  backgroundColor: "#AAAAAABB",
  x: 11,
  y: 7,
};

export const solarSystemConfig = {
  meta: {
    title: "Solar System Sample",
    subtitle: "Orbit simulation built with engine classes"
  },
  simulation: {
    sunRadius: 30
  },
  display: {
    orbitStroke: "rgba(170, 180, 200, 0.35)",
    moonColor: "white"
  }
};
