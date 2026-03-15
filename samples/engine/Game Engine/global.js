// ToolboxAid.com
// David Quesenberry
// global.js
// 03/15/2026

import DebugFlag from '../../../engine/utils/debugFlag.js';

export const canvasConfig = {
  width: 1024,
  height: 768,
  scale: 0.35,
  backgroundColor: '#1f0b57',
  borderColor: '#ed9700',
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
  color: '#ed9700',
  font: `28px ${uiFont.ui}`,
  text: 'Click the canvas to toggle fullscreen.',
  x: 220,
  y: 730
};

export const playerSelect = {
  maxPlayers: 2,
  lives: 3,

  fillStyle: '#ed9700',
  font: `25px ${uiFont.ui}`,
  fillText: 'Select Player(s)',

  optionBaseX: 250,
  optionBaseY: 300,
  optionSpacing: 40
};

export const gameUi = {
  theme: {
    colors: {
      textPrimary: '#ffffff',
      textSecondary: '#f3d8ab',
      accent: '#ed9700',
      danger: '#ff845f',
      panel: '#200c5acc',
      panelBackdrop: '#120629cc',
      panelDanger: '#3a1220cc',
      panelPause: '#24104acc',
      panelPlay: '#1b0a4ccc'
    },
    panelX: 120,
    panelY: 120,
    panelWidth: 784,
    panelHeight: 430,
    panelColor: '#200c5acc',
    panelBorderColor: '#ed9700',
    panelBorderSize: 3,
    accentColor: '#ed9700',
    subtitleColor: '#f3d8ab',
    fontDisplay: uiFont.display,
    fontUi: uiFont.ui,
    fontMono: uiFont.mono
  },
  performance: {
    show: DebugFlag.has('perf'),
    size: 24,
    font: uiFont.mono,
    colorLow: '#72f1b8',
    colorMed: '#ed9700',
    colorHigh: '#ff6b6b',
    backgroundColor: '#20104fcc',
    x: canvasConfig.width - 344,
    y: canvasConfig.height - 178
  },
  attract: {
    color: '#ffffff',
    font: `46px ${uiFont.display}`,
    titleY: 180,
    promptY: 275,
    subtitleY: 325
  },
  playerSelect: {
    titleY: 170,
    titleColor: '#ffffff',
    titleFont: `42px ${uiFont.display}`,
    subtitleY: 262,
    subtitleColor: '#d7f7ff',
    subtitleFont: `24px ${uiFont.ui}`
  },
  gameOver: {
    color: '#ff5a5a',
    font: `52px ${uiFont.display}`,
    titleY: 185,
    promptY: 280,
    subtitleY: 330
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
