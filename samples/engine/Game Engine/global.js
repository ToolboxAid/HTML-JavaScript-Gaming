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
  size: 24,
  font: "monospace",
  colorLow: "#72f1b8",
  colorMed: "#ffd166",
  colorHigh: "#ff6b6b",
  backgroundColor: "#0a1626cc",

  x: 680,
  y: 590,
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
};

export const gameUi = {
  theme: {
    panelX: 120,
    panelY: 120,
    panelWidth: 784,
    panelHeight: 430,
    panelColor: '#101a2fcc',
    panelBorderColor: '#66d9ff',
    panelBorderSize: 3,
    accentColor: '#66d9ff',
    subtitleColor: '#d7f7ff'
  },
  attract: {
    color: '#ffffff',
    font: '46px Segoe UI',
    titleX: 200,
    titleY: 230,
    promptX: 230,
    promptY: 300,
    subtitleX: 230,
    subtitleY: 350
  },
  playerSelect: {
    titleX: 210,
    titleY: 190,
    titleColor: '#ffffff',
    titleFont: '42px Segoe UI',
    subtitleX: 210,
    subtitleY: 235,
    subtitleColor: '#d7f7ff',
    subtitleFont: '24px Segoe UI'
  },
  gameOver: {
    color: '#ff5a5a',
    font: '52px Segoe UI',
    titleX: 290,
    titleY: 250,
    promptX: 230,
    promptY: 320,
    subtitleX: 250,
    subtitleY: 370
  },
  pause: {
    textX: 250,
    textY: 270,
    promptX: 215,
    promptY: 330,
    scale: 3.5,
    color: '#ffffff',
    subtitleX: 230,
    subtitleY: 385,
    subtitleScale: 2.2,
    subtitleColor: '#d7f7ff'
  },
  play: {
    infoX: 120,
    infoY: 170,
    deathPromptX: 120,
    deathPromptY: 250,
    scorePromptX: 120,
    scorePromptY: 300,
    pausePromptX: 120,
    pausePromptY: 350,
    scale: 3.2,
    color: '#ffffff',
    labelScale: 2.2,
    labelColor: '#d7f7ff'
  }
};
