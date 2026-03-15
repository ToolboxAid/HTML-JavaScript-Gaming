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
};

export const gameUi = {
  attract: {
    color: 'white',
    font: '30px Arial',
    titleX: 250,
    titleY: 200,
    promptX: 250,
    promptY: 300
  },
  gameOver: {
    color: 'red',
    font: '30px Arial',
    titleX: 300,
    titleY: 200,
    promptX: 250,
    promptY: 300
  },
  pause: {
    textX: 150,
    textY: 200,
    promptX: 150,
    promptY: 250,
    scale: 3.5,
    color: 'white'
  },
  play: {
    infoX: 100,
    infoY: 200,
    deathPromptX: 100,
    deathPromptY: 250,
    scorePromptX: 100,
    scorePromptY: 300,
    pausePromptX: 100,
    pausePromptY: 350,
    scale: 3.5,
    color: 'white'
  }
};

