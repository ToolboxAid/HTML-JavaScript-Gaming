// ToolboxAid.com
// David Quesenberry
// global.js
// 10/16/2024

import DebugFlag from '../../../engine/utils/debugFlag.js';

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

export const uiFont = Object.freeze({
  display: 'Segoe UI',
  ui: 'Segoe UI',
  mono: 'monospace'
});

export const safeArea = Object.freeze({
  x: 20,
  y: 20
});

export const fullscreenConfig = {
  color: 'yellow',
  font: '40px Arial',
  text: 'Click here to enter fullscreen',
  x: 230,
  y: 790
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
    colors: {
      textPrimary: '#ffffff',
      textSecondary: '#d7f7ff',
      accent: '#66d9ff',
      danger: '#ff5a5a',
      panel: '#101a2fcc',
      panelBackdrop: '#07101fcc',
      panelDanger: '#2d0f18cc',
      panelPause: '#0c1e22cc',
      panelPlay: '#0f1f33cc'
    },
    panelX: 120,
    panelY: 120,
    panelWidth: 784,
    panelHeight: 430,
    panelColor: '#101a2fcc',
    panelBorderColor: '#66d9ff',
    panelBorderSize: 3,
    accentColor: '#66d9ff',
    subtitleColor: '#d7f7ff',
    fontDisplay: uiFont.display,
    fontUi: uiFont.ui,
    fontMono: uiFont.mono
  },
  performance: {
    show: DebugFlag.has('perf'),
    size: 24,
    font: uiFont.mono,
    colorLow: '#72f1b8',
    colorMed: '#ffd166',
    colorHigh: '#ff6b6b',
    backgroundColor: '#0a1626cc',
    x: canvasConfig.width - 344,
    y: canvasConfig.height - 178
  },
  attract: {
    color: '#ffffff',
    font: `46px ${uiFont.display}`,
    titleY: 230,
    promptY: 300,
    subtitleY: 350
  },
  playerSelect: {
    titleY: 190,
    titleColor: '#ffffff',
    titleFont: `42px ${uiFont.display}`,
    subtitleY: 235,
    subtitleColor: '#d7f7ff',
    subtitleFont: `24px ${uiFont.ui}`
  },
  gameOver: {
    color: '#ff5a5a',
    font: `52px ${uiFont.display}`,
    titleY: 250,
    promptY: 320,
    subtitleY: 370
  },
  pause: {
    textY: 270,
    promptY: 330,
    scale: 3.5,
    color: '#ffffff',
    subtitleY: 385,
    subtitleScale: 2.2,
    subtitleColor: '#d7f7ff'
  },
  play: {
    infoY: 170,
    deathPromptY: 250,
    scale: 3.2,
    color: '#ffffff',
    labelScale: 2.2,
    labelColor: '#d7f7ff'
  }
};

gameUi.theme.panelColor = gameUi.theme.colors.panel;
gameUi.theme.panelBorderColor = gameUi.theme.colors.accent;
gameUi.theme.accentColor = gameUi.theme.colors.accent;
gameUi.theme.subtitleColor = gameUi.theme.colors.textSecondary;
gameUi.attract.color = gameUi.theme.colors.textPrimary;
gameUi.playerSelect.titleColor = gameUi.theme.colors.textPrimary;
gameUi.playerSelect.subtitleColor = gameUi.theme.colors.textSecondary;
gameUi.gameOver.color = gameUi.theme.colors.danger;
gameUi.pause.color = gameUi.theme.colors.textPrimary;
gameUi.pause.subtitleColor = gameUi.theme.colors.textSecondary;
gameUi.play.color = gameUi.theme.colors.textPrimary;
gameUi.play.labelColor = gameUi.theme.colors.textSecondary;

export const performanceConfig = {
  show: gameUi.performance.show,
  size: gameUi.performance.size,
  font: gameUi.performance.font,
  colorLow: gameUi.performance.colorLow,
  colorMed: gameUi.performance.colorMed,
  colorHigh: gameUi.performance.colorHigh,
  backgroundColor: gameUi.performance.backgroundColor,
  x: gameUi.performance.x,
  y: gameUi.performance.y
};
