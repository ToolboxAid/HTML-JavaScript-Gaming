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
  backgroundColor: "#1f0b57",
  borderColor: "#ed9700",
  borderSize: 15,
};

export const uiFont = Object.freeze({
  display: 'Segoe UI',
  ui: 'Segoe UI',
  mono: 'monospace'
});

export const fullscreenConfig = {
  color: '#ed9700',
  font: '28px Segoe UI',
  text: 'Click the canvas to toggle fullscreen.',
  x: 230,
  y: 790
};

export const performanceConfig = {
  show: true,
  size: 10,
  font: "monospace",
  colorLow: "#7bd389",
  colorMed: "#ed9700",
  colorHigh: "#ff5f57",
  backgroundColor: "#AAAAAABB",

  x: 525,
  y: 10,
}

export const playerSelect = {
  maxPlayers: 2,
  lives: 3,

  color: "#ed9700",
  font: `25px ${uiFont.ui}`,
  title: "Select Player(s)",

  x: 250,
  y: 300,
  spacing: 40
}

export const sideScrollUi = {
  screens: {
    attract: {
      lines: [
        { text: 'Welcome to the 2D Tile Map!', y: 170, fontSize: 30, fontFamily: uiFont.display, color: '#ffffff' },
        { text: 'Press Enter or Start to Begin', y: 205, fontSize: 30, fontFamily: uiFont.display, color: '#ffffff' },
        { text: 'Move with Arrow Keys or D-pad', y: 245, fontSize: 30, fontFamily: uiFont.display, color: '#ffffff' }
      ]
    },
    gameOver: {
      lines: [
        { text: 'Game Over', y: 200, fontSize: 30, fontFamily: uiFont.display, color: '#ff5f57' },
        { text: 'Press Enter or Start to Restart', y: 300, fontSize: 30, fontFamily: uiFont.display, color: '#ff5f57' }
      ]
    },
    pause: {
      lines: [
        { text: 'Game Paused.', y: 200, fontSize: 30, fontFamily: uiFont.display, color: '#ffffff' },
        { text: 'Press P or Select to unpause', y: 250, fontSize: 30, fontFamily: uiFont.display, color: '#ffffff' }
      ]
    },
    play: {
      infoY: 200,
      infoFontSize: 30,
      infoFontFamily: uiFont.display,
      infoColor: '#ffffff',
      promptsY: 250,
      prompts: [
        'Press D or B for player death',
        'Press S or A for score',
        'Press P or Select to pause'
      ],
      promptFontSize: 30,
      promptLineHeight: 50,
      promptFontFamily: uiFont.display,
      promptColor: '#ffffff'
    }
  }
};

export const spriteConfig = {
  pixelSize: 2.0,

  playerLives: 3,
  playerBonusScore: 1500,
  playerColor: 'white',
}
